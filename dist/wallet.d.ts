import { IWallet, IProfileOptions, IProfile, IProfileObject, IContract, IContractPrivate, IContractPublic, IContractData, IPledge } from './interfaces';
export { IContractData, IPledge };
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
