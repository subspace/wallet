import { IProfileOptions, IProfile, IProfileObject, IContract, IContractPrivate, IContractData, IPledge, IContractPublic } from './interfaces';
export { IContractData, IPledge, IProfileObject, IProfileOptions };
export default class Wallet {
    storage: any;
    constructor(storage: any);
    private keyChain;
    profile: IProfile;
    contract: IContract;
    init(options: IProfileOptions): Promise<void>;
    createProfile(options?: IProfileOptions): Promise<IProfileObject>;
    getProfile(): IProfileObject;
    getContract(): IContractPublic;
    getPrivateContract(): IContractPrivate;
    clear(): Promise<void>;
}
