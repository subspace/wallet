# Subspace Wallet Module

Manages openpgp keys for user profiles and storage contracts.

* [Usage](#usage)
* [API](#api)
* [Dev Usage](#development-usage)

## Usage as a module

Install this module as a dependency into another project

```
$ yarn add 'https://www.github.com/subspace/wallet.git'
```

Require this module inside a script

```javascript
const wallet = require('@subspace/wallet')
```

## API

* **[`wallet.init()`](#init)**
* **[`wallet.createProfile()`](#createProfile)**
* **[`wallet.getProfile()`](#getProfile)**
* **[`wallet.createContract()`](#createContract)**
* **[`wallet.getContract()`](#getContract)**
* **[`wallet.clear()`](#clear)**

<a name="init"></a>
### `async wallet.init([callback])`
Initiates the wallet. Loads existing profile, contract, and keys from disk, if they are saved to local storage. Else creates a new profile (default options) and key, but not a contract.

Returns a void callback or promise if no callback is specified.

<a name="createProfile"></a>
### `async wallet.createProfile([options], [callback]): profileObject`
Creates a new user profile and key with specified options, and saves to local storage. If no options are passed creates a profile and key with defaults.

```js
let options = {
  name: 'Gavin Belson',      // optional name to associate with profile
  email: 'gavin@hooli.com',  // optional email to associate with profile
  passphrase: 'box_three',   // optional passhprase to associate with profile
```


Returns a profileObject through a callback or promise if no callback is specified.

<a name="getProfile"></a>
### `async wallet.getProfile(): profileObject`
Retrieves the current contract for usage by other modules.

Returns a contractObject.

<a name="createContract"></a>
### `async wallet.createContract([options], [callback]): contractObject`
Creates a new storage contract and contract key with specified options, and saves to local storage. If no options are passed creates a contract and key with defaults. If  `ttl` is passed or defaults are used a mutable storage contract will be created. If `ttl` is passed in as null an immutable storage contract will be created and `replicationFactor` will self-adjust based on number of log(2) of number of hosts on the network.

```js
let options = {
  name: 'Gavin Belson',       // optional name to associate with contract
  email: 'gavin@hooli.com',   // optional email to associate with contract
  passphrase: 'box_three',    // optional passhprase to associate with contract
  spaceReserved: 1000000000,  // space reserved in bytes, 1 GB is default
  ttl: 2628000000,            // time to live in ms, 1 month is default
  replicationFactor: 4        // number of replicas for each shard, 4 is default
```

Returns a contractObject through a callback or promise if no callback is specified.

<a name="getContract"></a>
### `async wallet.getContract(): contractObject | Error`
Retrieves the current contract for usage by other modules. Throws an error if no contract has been created.

Returns a contractObject or an error.

<a name="clear"></a>
### `async wallet.clear([callback])`
Deletes the existing profile, contract, and all associated keys.

Returns a void callback or promise if no callback is specified.


## Development usage

Clone and install the repo locally   

```
$ git clone https://www.github.com/subspace/wallet.git
$ cd wallet
$ yarn
```

Edit code in src/main.ts

Build manually.  

```
$ tsc -w
```

[Instructions](https://code.visualstudio.com/docs/languages/typescript#_step-2-run-the-typescript-build) to automate with visual studio code.

Run tests with

```
$ npx jest
```