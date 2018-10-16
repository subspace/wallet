import * as crypto from '@subspace/crypto'
import * as interfaces from './interfaces'

// TODO 
  // must fix crypto.generateKeys() build so options can be passed in
  // need to import storage instead of pass to constructor to test properly 
  // method to create user key pair within apps (maybe)
  // method to backup keys to SSDB under the passphrase
  // explore BLS signature as an alternative (like Chia)
  // explore HD keys as seed for encryption of backed up private keys

export default class Wallet implements interfaces.IWallet {
  constructor( public storage: any) {}
  private keyChain: interfaces.IKeyChain = {
    keys: [],
    addKey:  async (type: string): Promise<string> => {
      const keyPair = await crypto.generateKeys()
      const key: interfaces.IKey = {
        id: crypto.getHash(keyPair.publicKeyArmored),
        type: type,
        createdAt: Date.now(),
        public: keyPair.publicKeyArmored,
        private: keyPair.privateKeyArmored,
        privateObject: null
      }
      this.keyChain.keys.push(key)
      await this.keyChain.save()
      return key.id
    },
    openKey: async (id: string, passphrase: string): Promise<interfaces.IKey> => {
      const key = this.keyChain.keys.filter(key => key.id === id)[0]
      key.privateObject = await crypto.getPrivateKeyObject(key.private, passphrase)
      return key
    },
    removeKey: async (id: string) => {
      this.keyChain.keys = this.keyChain.keys.filter(key => key.id !== id)
      await this.keyChain.save()
    },
    save: async () => {
      await this.storage.put('keys', JSON.stringify(this.keyChain.keys))
    },
    load: async () => {
      const keys = JSON.parse( await this.storage.get('keys'))
      if (keys) {
        this.keyChain.keys = keys
      }
    },
    clear: async () => {
      this.keyChain.keys = []
      await this.storage.del('keys')
    }
  }
  public profile: interfaces.IProfile = {
    user: null,
    key: null,
    create: async (options?: interfaces.IProfileOptions) => {
      const keyId = await this.keyChain.addKey('profile')
      this.profile.user = {
        id: keyId,
        name: options.name,
        email: options.email,
        passphrase: options.passphrase,
        createdAt: Date.now()
      }

      this.profile.key = await this.keyChain.openKey(keyId, options.passphrase)
      await this.profile.save()
    },
    save: async () => {
      await this.storage.put('user', JSON.stringify(this.profile.user))
    },
    load: async () => {
      const user = JSON.parse( await this.storage.get('user'))
      if (user) {
        this.profile.user = user
        this.profile.key = await this.keyChain.openKey(this.profile.user.id, this.profile.user.passphrase)
      }
    },
    clear: async () => {
      await this.keyChain.removeKey(this.profile.user.id)
      this.profile.user = null
      this.profile.key = null
      await this.storage.del('user')
    }
  }
  public contract: interfaces.IContract = {
    options: null,
    state: null,
    key: null,
    create: async (options: interfaces.IContractOptions) => {
      const keyId = await this.keyChain.addKey('contract')
      this.contract.key = await this.keyChain.openKey(keyId, options.passphrase)
      this.contract.options = {
        id: keyId,
        name: options.name,
        email: options.email,
        passphrase: options.passphrase,
        ttl: options.ttl,
        replicationFactor: options.replicationFactor,
        spaceReserved: options.spaceReserved,
        createdAt: Date.now()
      }
      this.contract.state = {
        spaceUsed: 0,
        updatedAt: null,
        recordIndex: []
      }
      await this.contract.save()
    },
    save: async () => {
      await this.storage.put('contract', JSON.stringify({
        options: this.contract.options,
        state: this.contract.state
      }))
    },
    load: async () => {
      const contract = JSON.parse( await this.storage.get('contract'))
      if (contract) {
        this.contract.options = contract.options
        this.contract.state = contract.state
        this.contract.key = await this.keyChain.openKey(contract.options.id, contract.options.passphrase)
      } 
    },
    clear: async () => {
      await this.keyChain.removeKey(this.contract.options.id)
      this.contract.options = null
      this.contract.state = null
      this.contract.key = null
      await this.storage.del('contract')
    },
    addRecord: async (id: string, size: number) => {
      this.contract.state.recordIndex.push(id)
      this.contract.state.spaceUsed += size
      this.contract.state.updatedAt = Date.now()
      await this.contract.save()
    },
    updateRecord: async (id: string, sizeDelta: number) => {
      this.contract.state.spaceUsed += sizeDelta
      this.contract.state.updatedAt = Date.now()
      await this.contract.save()
    },
    removeRecord: async (id: string, size: number) => {
      this.contract.state.recordIndex = this.contract.state.recordIndex.filter(record => record !== id)
      this.contract.state.spaceUsed -= size
      this.contract.state.updatedAt = Date.now()
      await this.contract.save()
    },
  }
  
  public async init() {
    // loads an existing profile, contract, and keys
    // if no profile on record will create a new one

    await this.keyChain.load()
    await this.profile.load()
    await this.contract.load()
    if (!this.profile) {
      this.profile.create()
    }
  }

  public async createProfile(options?: interfaces.IProfileOptions) {
    // creates a new profile, if one does not exist

    if (this.profile.user) {
      throw new Error('A profile already exists, clear existing first')
    } 
    await this.profile.create(options)
  }

  public getProfile() {
    const profile: interfaces.IProfileObject = {
      id: this.profile.user.id,
      name: this.profile.user.name,
      email: this.profile.user.email,
      passphrase: this.profile.user.passphrase,
      createdAt: this.profile.user.createdAt,
      publicKey: this.profile.key.public,
      privateKey: this.profile.key.private
    }
    return profile
  }

  public async createContract(options: interfaces.IContractOptions) {
    // creates a new contract and returns contract object ready for transaction
    await this.contract.create(options)
  }

  public getContract() {
    if (!this.contract.options) {
      throw new Error('A contract does not exist, create one first')
    }

    const contract: interfaces.IContractObject = {
      id: this.contract.options.id,
      name: this.contract.options.name,
      email: this.contract.options.email,
      passphrase: this.contract.options.passphrase,
      ttl: this.contract.options.ttl,
      replicationFactor: this.contract.options.replicationFactor,
      spaceReserved: this.contract.options.spaceReserved,
      spaceUsed: this.contract.state.spaceUsed,
      createdAt: this.contract.options.createdAt,
      updatedAt: this.contract.state.updatedAt,
      recordIndex: this.contract.state.recordIndex,
      publicKey: this.contract.key.public,
      privateKey: this.contract.key.private
    }
    return contract
  }

  public async clear() {
    // deletes the the profile, contract, and all keys
    await this.profile.clear()
    await this.contract.clear()
    await this.keyChain.clear()
  }

  // Later

  // public async createUserKeys() {
  //   // allows developer to create new keys for their users that conform to standard

  //   // authentication 
  //     // user opens the app (fully client side)
  //     // user authenticates locally with a username/passphrase
  //     // this results in a get request to the subspace network
  //     // how does the app determine the lookup key for get?
  //     // what if it runs a query on a public key associated with app contract
  //     // get(public_key) -> contract state
  //     // in contract state query users map by hash (username|password)
  //     // get that public key from subspace (stored under the contract)
  //     // decrypt the record associated with that public key using my passphrase (but it would be encrypted with symkey by default)
  //     // what if you could provide an optional passphrase instead when creating the record, or have a special function for create user account 
  //   // authorization
  //     // now I have my keys, but how do I validate put requests
  //     // if my key is valid for writes 
  //     // any host can see the public key on the contract ACL and ensure that this is a valid write 


  //   // what should the user provide to setup an account?
  //   // username / email / password
  // }

  // public async backupKeys() {
  //   // backs up the keys on the subspace network
  //   // may use another key
  //   // may use a seed phrase
  //   // may use a password

  //   // using subspace schema, all records are encrypted using private key
  //   // how would you encrypt the private key itself?
  //   // would have to be with a passphrase
  //   // could crack by brute forcing it 

  //   // generate an HD key using a seedphrase
  //   // generate a PGP key normally
  //   // encrypt the PGP with the HD key
  //   // backup the encrytped PGP key to subspace 
  //   // this key can be recovered with the HD seedphrase

  //   // backup with a seedphrase that can regen the priva
  //   // backup with a passphrse but encrypted with the apps private key

  //   // can you brute force a BIP-32 seedphrase 
  // }

  // public async restoreKeysFromBackup() {
  //   // retrieves the keys that were backed up
  // }

  // public async restoreKeysFromSeed() {
  //   // if hd wallet is used this could restore the keys locally from a seed phrase
  //   // not sure if you can create hd keys with openpgp 
  // }
}

