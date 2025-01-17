
export interface IKeyOptions {
  name: string,
  email: string,
  passphrase: string
}

export interface IKeyChain {
  keys: IKey[]
  save(): Promise<void>
  load(): Promise<void>
  clear(): Promise<void>
  addKey(type: string, name: string, email: string, passphrase: string, publicKey?: string, privateKey?: string): Promise<string>
  openKey(id: string, passphrase: string): Promise<IKey>
  removeKey(id: string): void
}

export interface IKey {
  id: string
  type: string
  createdAt: number
  public: string
  private: string
  privateObject: any
}

export interface IProfileOptions extends IKeyOptions {}

export interface IProfile {
  user: {
    id: string
    name: string
    email: string
    passphrase: string
    createdAt: number
  }
  key: IKey
  proof: IProof
  pledge: IPledge
  create(options?: IProfileOptions): Promise<void>
  save(): Promise<void>
  load(): Promise<void>
  clear(): Promise<void>
}

export interface IProfileObject {
  id: string
  name: string
  email: string
  passphrase: string
  createdAt: number
  publicKey: string
  privateKey: string
  privateKeyObject: any
}

export interface IContractOptions {
  txId: string
  name: string
  email: string
  passphrase: string
  ttl: number
  replicationFactor: number
  spaceReserved: number
  createdAt: number
  contractSig: string
}

export interface IContractState {
  fundingTx: string
  spaceUsed: number
  recordIndex: Set<string>
}

export interface IContractData {
  options: IContractOptions
  state: IContractState
  key: IKey
}

export interface IContract extends IContractData {
  save(): Promise<void>
  load(): Promise<void>
  clear(): Promise<void>
  addRecord(id: string, size: number): Promise<void>
  updateRecord(id: string, sizeDelta: number): Promise<void>
  removeRecord(id: string, size: number): Promise<void>
  store(contract: IContractData): Promise<void>
}

export interface IContractPublic {
  txId: string                  // tx id
  createdAt: number           // tx created at
  spaceReserved: number     
  replicationFactor: number
  ttl: number
  contractSig: string
  contractId: string
}

// takes a snapshot for 

export interface IContractPrivate {
  txId: string              // contract id
  name: string            // readable name (default for now)
  email: string           // associated email (default for now)
  passphrase: string      // associated passprhrase (default for now)
  ttl: number             // defaults for one mont
  replicationFactor: number // defaults for 1 (should be four)
  spaceReserved: number     // defaults to 1 GB
  spaceUsed: number         
  createdAt: number
  recordIndex: Set<string>
  publicKey: string
  privateKey: string
  privateKeyObject: any
}

export interface IProof {
  id: string          // hash of my proof chain
  size: number        // size of proof in GB
  seed: string        // my public key
  plot: Set<string>      // the actual proof chain
  createdAt: number  // when created
}

export interface IPledge {
  proof: string     // hash of my proofchain (proof id)
  size: number      // number of bytes pledged
  interval: number  // ms between payments
  createdAt: number // timestamp to know when to get paid
  pledgeTx: string  // original pledge to the ledger
}


