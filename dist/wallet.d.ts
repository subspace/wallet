import { IProfileOptions, IProfile, IProfileObject, IContract, IContractPrivate, IContractPublic, IContractData, IPledge } from './interfaces';
export { IContractData, IPledge, IProfileObject, IProfileOptions };
export default class Wallet {
    storage: any;
    constructor(storage: any);
    private keyChain;
    profile: IProfile;
    contract: IContract;
    init(options: IProfileOptions, clearContract?: boolean): Promise<void>;
    createProfile(options?: IProfileOptions): Promise<IProfileObject>;
    getProfile(): IProfileObject;
    getPublicContract(): IContractPublic;
    getPrivateContract(): IContractPrivate;
    clear(): Promise<void>;
}
