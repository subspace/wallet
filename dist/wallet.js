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
// must fix crypto.generateKeys() build so options can be passed in
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
            addKey: async (type) => {
                const keyPair = await crypto.generateKeys();
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
            removeKey: async (id) => {
                this.keyChain.keys = this.keyChain.keys.filter(key => key.id !== id);
                await this.keyChain.save();
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
            create: async (options) => {
                const keyId = await this.keyChain.addKey('profile');
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
                await this.keyChain.removeKey(this.profile.user.id);
                this.profile.user = null;
                this.profile.key = null;
                await this.storage.del('user');
            }
        };
        this.contract = {
            options: null,
            state: null,
            key: null,
            create: async (options) => {
                const keyId = await this.keyChain.addKey('contract');
                this.contract.key = await this.keyChain.openKey(keyId, options.passphrase);
                this.contract.options = {
                    id: keyId,
                    name: options.name,
                    email: options.email,
                    passphrase: options.passphrase,
                    ttl: options.ttl,
                    replicationFactor: options.replicationFactor,
                    spaceReserved: options.spaceReserved,
                    createdAt: Date.now()
                };
                this.contract.state = {
                    spaceUsed: 0,
                    updatedAt: null,
                    recordIndex: []
                };
                await this.contract.save();
            },
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
                    this.contract.state = contract.state;
                    this.contract.key = await this.keyChain.openKey(contract.options.id, contract.options.passphrase);
                }
            },
            clear: async () => {
                await this.keyChain.removeKey(this.contract.options.id);
                this.contract.options = null;
                this.contract.state = null;
                this.contract.key = null;
                await this.storage.del('contract');
            },
            addRecord: async (id, size) => {
                this.contract.state.recordIndex.push(id);
                this.contract.state.spaceUsed += size;
                this.contract.state.updatedAt = Date.now();
                await this.contract.save();
            },
            updateRecord: async (id, sizeDelta) => {
                this.contract.state.spaceUsed += sizeDelta;
                this.contract.state.updatedAt = Date.now();
                await this.contract.save();
            },
            removeRecord: async (id, size) => {
                this.contract.state.recordIndex = this.contract.state.recordIndex.filter(record => record !== id);
                this.contract.state.spaceUsed -= size;
                this.contract.state.updatedAt = Date.now();
                await this.contract.save();
            },
        };
    }
    async init() {
        // loads an existing profile, contract, and keys
        // if no profile on record will create a new one
        await this.keyChain.load();
        await this.profile.load();
        await this.contract.load();
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
            privateKey: this.profile.key.private
        };
        return profile;
    }
    async createContract(options) {
        // creates a new contract and returns contract object ready for transaction
        await this.contract.create(options);
        return this.getContract();
    }
    getContract() {
        if (!this.contract.options) {
            throw new Error('A contract does not exist, create one first');
        }
        const contract = {
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
        };
        return contract;
    }
    async clear() {
        // deletes the the profile, contract, and all keys
        await this.profile.clear();
        await this.contract.clear();
        await this.keyChain.clear();
    }
}
exports.default = Wallet;
//# sourceMappingURL=wallet.js.map