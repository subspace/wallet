"use strict";
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const crypto = __importStar(require("@subspace/crypto"));
// TODO 
// need to import storage instead of pass to constructor to test properly 
// method to create user key pair within apps (maybe)
// method to backup keys to SSDB under the passphrase
// explore BLS signature as an alternative (like Chia)
// explore HD keys as seed for encryption of backed up private keys
class Wallet {
    constructor(storage) {
        this.storage = storage;
        this.keyChain = {
            keys: [],
            addKey: async (type, name, email, passphrase) => {
                const keyPair = await crypto.generateKeys(name, email, passphrase);
                const key = {
                    id: crypto.getHash(keyPair.publicKeyArmored),
                    type: type,
                    createdAt: Date.now(),
                    public: keyPair.publicKeyArmored,
                    private: keyPair.privateKeyArmored,
                    privateObject: null
                };
                this.keyChain.keys.push(key);
                await this.keyChain.save();
                return key.id;
            },
            openKey: async (id, passphrase) => {
                const key = this.keyChain.keys.filter(key => key.id === id)[0];
                key.privateObject = await crypto.getPrivateKeyObject(key.private, passphrase);
                return key;
            },
            removeKey: (id) => {
                this.keyChain.keys = this.keyChain.keys.filter(key => key.id !== id);
                this.keyChain.save();
            },
            save: async () => {
                await this.storage.put('keys', JSON.stringify(this.keyChain.keys));
            },
            load: async () => {
                const keys = JSON.parse(await this.storage.get('keys'));
                if (keys) {
                    this.keyChain.keys = keys;
                }
            },
            clear: async () => {
                this.keyChain.keys = [];
                await this.storage.del('keys');
            }
        };
        this.profile = {
            user: null,
            key: null,
            proof: null,
            pledge: null,
            create: async (options) => {
                const keyId = await this.keyChain.addKey('profile', options.name, options.email, options.passphrase);
                this.profile.user = {
                    id: keyId,
                    name: options.name,
                    email: options.email,
                    passphrase: options.passphrase,
                    createdAt: Date.now()
                };
                this.profile.key = await this.keyChain.openKey(keyId, options.passphrase);
                await this.profile.save();
            },
            save: async () => {
                await this.storage.put('user', JSON.stringify(this.profile.user));
            },
            load: async () => {
                const user = JSON.parse(await this.storage.get('user'));
                if (user) {
                    this.profile.user = user;
                    this.profile.key = await this.keyChain.openKey(this.profile.user.id, this.profile.user.passphrase);
                }
            },
            clear: async () => {
                const p1 = this.keyChain.removeKey(this.profile.user.id);
                this.profile.user = null;
                this.profile.key = null;
                const p2 = this.storage.del('user');
                await Promise.all([p1, p2]);
            }
        };
        this.contract = {
            options: null,
            state: null,
            key: null,
            save: async () => {
                await this.storage.put('contract', JSON.stringify({
                    options: this.contract.options,
                    state: this.contract.state
                }));
            },
            load: async () => {
                const contract = JSON.parse(await this.storage.get('contract'));
                if (contract) {
                    this.contract.options = contract.options;
                    this.contract.key = await this.keyChain.openKey(contract.options.id, contract.options.passphrase);
                }
            },
            store: async (contract) => {
                this.contract.key = contract.key;
                this.contract.options = contract.options;
                this.contract.state = contract.state;
                await this.contract.save();
            },
            clear: async () => {
                await this.keyChain.removeKey(this.contract.options.id);
                this.contract.options = null;
                this.contract.key = null;
                await this.storage.del('contract');
            },
            addRecord: async (id, size) => {
                this.contract.state.recordIndex.add(id);
                this.contract.state.spaceUsed += (size * this.contract.options.replicationFactor);
                await this.contract.save();
            },
            updateRecord: async (id, sizeDelta) => {
                this.contract.state.spaceUsed += (sizeDelta * this.contract.options.replicationFactor);
                await this.contract.save();
            },
            removeRecord: async (id, size) => {
                this.contract.state.recordIndex.delete(id);
                this.contract.state.spaceUsed -= (size * this.contract.options.replicationFactor);
                await this.contract.save();
            },
        };
    }
    async init() {
        // loads an existing profile, contract, and keys
        // if no profile on record will create a new one
        await this.keyChain.load();
        const p1 = this.profile.load();
        const p2 = this.contract.load();
        await Promise.all([p1, p2]);
        if (!this.profile) {
            this.profile.create();
        }
    }
    async createProfile(options) {
        // creates a new profile, if one does not exist
        if (this.profile.user) {
            throw new Error('A profile already exists, clear existing first');
        }
        await this.profile.create(options);
        return this.getProfile();
    }
    getProfile() {
        const profile = {
            id: this.profile.user.id,
            name: this.profile.user.name,
            email: this.profile.user.email,
            passphrase: this.profile.user.passphrase,
            createdAt: this.profile.user.createdAt,
            publicKey: this.profile.key.public,
            privateKey: this.profile.key.private,
            privateKeyObject: this.profile.key.privateObject
        };
        return profile;
    }
    // public async createContract(options: IContractOptions) {
    //   // creates a new contract and returns contract object ready for transaction
    //   await this.contract.create(options)
    //   return this.getContract()
    // }
    getPublicContract() {
        if (!this.contract.options) {
            throw new Error('A contract does not exist, create one first');
        }
        const contract = {
            id: this.contract.options.id,
            ttl: this.contract.options.ttl,
            replicationFactor: this.contract.options.replicationFactor,
            spaceReserved: this.contract.options.spaceReserved,
            createdAt: this.contract.options.createdAt,
            contractSig: this.contract.options.contractSig
        };
        return contract;
    }
    getPrivateContract() {
        if (!this.contract.options) {
            throw new Error('A contract does not exist, create one first');
        }
        const contract = {
            id: this.contract.options.id,
            owner: this.contract.options.owner,
            name: this.contract.options.name,
            email: this.contract.options.email,
            passphrase: this.contract.options.passphrase,
            ttl: this.contract.options.ttl,
            replicationFactor: this.contract.options.replicationFactor,
            spaceReserved: this.contract.options.spaceReserved,
            spaceUsed: this.contract.state.spaceUsed,
            createdAt: this.contract.options.createdAt,
            recordIndex: this.contract.state.recordIndex,
            publicKey: this.contract.key.public,
            privateKey: this.contract.key.private,
            privateKeyObject: this.contract.key.privateObject
        };
        return contract;
    }
    async clear() {
        // deletes the the profile, contract, and all keys
        const p1 = this.profile.clear();
        const p2 = this.contract.clear();
        await Promise.all([p1, p2]);
        // keychains should already be empty, just in case
        await this.keyChain.clear();
    }
}
exports.default = Wallet;
//# sourceMappingURL=wallet.js.map