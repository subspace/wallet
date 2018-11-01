import { IWallet, IProfileOptions, IProfile, IProfileObject, IContract, IContractPrivate, IContractPublic, IContractData, IPledge } from './interfaces';
export { IContractData, IPledge, IProfileOptions };
export default class Wallet implements IWallet {
    storage: any;
    constructor(storage: any);
    private keyChain;
    profile: IProfile;
    contract: IContract;
    init(options: IProfileOptions): Promise<void>;
    createProfile(options?: IProfileOptions): Promise<IProfileObject>;
    getProfile(): IProfileObject;
    getPublicContract(): IContractPublic;
    getPrivateContract(): IContractPrivate;
    clear(): Promise<void>;
}
