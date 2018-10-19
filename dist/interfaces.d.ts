export interface IWallet {
    profile: IProfile;
    contract: IContract;
    init(): Promise<void>;
    createProfile(options?: IProfileOptions): Promise<IProfileObject>;
    getProfile(): IProfileObject;
    getContract(): IContractObject;
    clear(): Promise<void>;
}
export interface IKeyOptions {
    name: string;
    email: string;
    passphrase: string;
}
export interface IKeyChain {
    keys: IKey[];
    save(): Promise<void>;
    load(): Promise<void>;
    clear(): Promise<void>;
    addKey(type: string, name: string, email: string, passphrase: string): Promise<string>;
    openKey(id: string, passphrase: string): Promise<IKey>;
    removeKey(id: string): void;
}
export interface IKey {
    id: string;
    type: string;
    createdAt: number;
    public: string;
    private: string;
    privateObject: any;
}
export interface IProfileOptions extends IKeyOptions {
}
export interface IProfile {
    user: {
        id: string;
        name: string;
        email: string;
        passphrase: string;
        createdAt: number;
    };
    key: IKey;
    proof: IProof;
    pledge: IPledge;
    create(options?: IProfileOptions): Promise<void>;
    save(): Promise<void>;
    load(): Promise<void>;
    clear(): Promise<void>;
}
export interface IProfileObject {
    id: string;
    name: string;
    email: string;
    passphrase: string;
    createdAt: number;
    publicKey: string;
    privateKey: string;
    privateKeyObject: any;
}
export interface IContractOptions extends IKeyOptions {
    spaceReserved: number;
    ttl: number;
    replicationFactor: number;
}
export interface IContract {
    options: {
        id: string;
        owner: string;
        name: string;
        email: string;
        passphrase: string;
        ttl: number;
        replicationFactor: number;
        spaceReserved: number;
        createdAt: number;
    };
    state: {
        spaceUsed: 0;
        updatedAt: number;
        recordIndex: Set<string>;
    };
    key: IKey;
    storeContract(contract: any): void;
    create(options: IContractOptions): Promise<void>;
    save(): Promise<void>;
    load(): Promise<void>;
    clear(): Promise<void>;
    addRecord(id: string, size: number): Promise<void>;
    updateRecord(id: string, sizeDelta: number): Promise<void>;
    removeRecord(id: string, size: number): Promise<void>;
}
export interface IContractObject {
    kind: 'contractObject';
    id: string;
    owner: string;
    name: string;
    email: string;
    passphrase: string;
    ttl: number;
    replicationFactor: number;
    spaceReserved: number;
    spaceUsed: number;
    createdAt: number;
    updatedAt: number;
    recordIndex: Set<string>;
    publicKey: string;
    privateKey: string;
    privateKeyObject: any;
}
export interface IProof {
    id: string;
    size: number;
    seed: string;
    plot: string[];
    createdAt: number;
}
export interface IPledge {
    proof: string;
    size: number;
    interval: number;
}
