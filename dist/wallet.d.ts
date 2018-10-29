import { IWallet, IProfileOptions, IProfile, IProfileObject, IContract, IContractPrivate, IContractPublic } from './interfaces';
export default class Wallet implements IWallet {
    storage: any;
    constructor(storage: any);
    private keyChain;
    profile: IProfile;
    contract: IContract;
    init(): Promise<void>;
    createProfile(options?: IProfileOptions): Promise<IProfileObject>;
    getProfile(): IProfileObject;
    getPublicContract(): IContractPublic;
    getPrivateContract(): IContractPrivate;
    clear(): Promise<void>;
}
