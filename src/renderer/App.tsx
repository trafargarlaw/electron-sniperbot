import 'tailwindcss/tailwind.css';
import './App.css';
import Web3 from 'web3';
import { SignedTransaction } from 'web3-core';
import {
  MinusSmIcon,
  SwitchHorizontalIcon,
  XIcon,
} from '@heroicons/react/outline';
import { useState, useEffect } from 'react';

import {
  getBalance,
  getCode,
  getTransactionCount,
  pancakeContract,
} from './transaction';
import Console from './Console';
import pancake from '../../assets/pancake.svg';
import snipe from '../../assets/snipe.svg';
import bnb from '../../assets/bnb.svg';
// import BUSD from '../../assets/busd.svg';
// import USDT from '../../assets/usdt.svg';
// import ETHER from '../../assets/ether.svg';

import { ipcRenderer } from 'electron';

const web3 = new Web3(
  new Web3.providers.HttpProvider(
    'https://data-seed-prebsc-1-s1.binance.org:8545'
  ) // https://bsc-dataseed.binance.org/
);

const Dragable = () => (
  <div className="flex flex-col space-y-1 mt-1">
    <h1 className="pointer-events-none">Pancake Sniper</h1>
  </div>
);

const Toggle = () => (
  <div className="overflow-hidden">
    <div className=" relative ">
      <input type="checkbox" className="peer hidden group" id="toggle" />
      <label
        htmlFor="toggle"
        className="flex items-center  relative bg-gray-400 w-[99px] h-[39px] rounded-3xl overflow-hidden  text-center peer-checked:bg-gradient-to-l bg-opacity-80 peer-checked:from-[#0610ff] peer-checked:to-[#fc27274c]  peer-checked:after:-translate-y-5 peer-checked:before:left-[60px] before:overflow-hidden before:transition-[left]  before:ease-in-out before:content-[''] before:rounded-full before:h-8 before:w-8 before:top-1/2 before:-translate-y-1/2 before:absolute before:left-2 before:bg-white  before:cursor-pointer "
      >
        {' '}
      </label>
      <span className="absolute left-[12px] top-[10px] text-[13px] pointer-events-none peer-checked:-translate-y-8 transition-[transform] duration-500 ">
        {' '}
        OFF
      </span>
      <span className="absolute left-[66.5px] top-0 textGradient -translate-y-8 pointer-events-none peer-checked:translate-y-[10.5px] transition-[transform] duration-500 ">
        {' '}
        ON
      </span>
    </div>
  </div>
);
interface txParams {
  gas: any;
  gasPrice: any;
  nonce: any;
  chainId: number;
  value: any;
  to: string;
  data?: any;
}

export default function App() {
  const [logger, setLogger] = useState<string[]>([]);

  const [txType, setTxType] = useState<string>('buy');
  const [wbnbAddress, setWbnbAddress] = useState(
    '0xae13d989dac2f0debff460ac112a837c89baa7cd'
  );
  const [network, setNetwork] = useState<string>('Testnet');
  const [token, setToken] = useState<string>('0x');
  const [isContract, setIsContract] = useState<boolean>();
  const [balance, setBalance] = useState<string>('Enter private key');
  const [address, setAddress] = useState<string>('0x');
  const [privateKey, setPrivateKey] = useState<string>('0x');
  const [amount, setAmount] = useState<string>('0');
  const [gasLimit, setGasLimit] = useState<number>(500000);
  const [gasPrice, setGasPrice] = useState<number>(25);
  const [slippage, setSlippage] = useState<number>(15);
  const [chainId, setChainId] = useState<number>(97);
  const [pancakeContractAddress, setPancakeContractAddress] = useState<string>(
    '0x9ac64cc6e4415144c455bd8e4837fea55603e5c3'
  );
  const [nonce, setNonce] = useState<number>(0);
  const [txParams, setTxParams] = useState<txParams>();
  useEffect(() => {
    setTxParams({
      gas: web3.utils.toHex(gasLimit),
      gasPrice: web3.utils.toHex(web3.utils.toWei(gasPrice.toString(), 'Gwei')),
      nonce: web3.utils.toHex(nonce),
      chainId: chainId,
      value: web3.utils.toHex(web3.utils.toWei(amount, 'ether')),
      to: pancakeContractAddress,
    });
  }, [gasLimit, gasPrice, nonce, amount, pancakeContractAddress, chainId]);

  useEffect(() => {
    if (privateKey.length === 66) {
      getBalance(address)
        .then((result) => {
          setBalance(web3.utils.fromWei(result, 'ether'));
          setLogger([
            ...logger,
            `balance was set to ${web3.utils.fromWei(result, 'ether')}`,
          ]);
          return result;
        })
        .catch(ErrorToConsole);
    } else {
      setBalance(`Enter private key`);
    }
  }, [address]);
  useEffect(() => {
    console.log(token);
    if (token.length === 42) {
      getCode(token)
        .then((result: string) => {
          if (result === '0x') {
            setIsContract(false);
            setLogger([
              ...logger,
              `${token.substring(0, 6)}...${token.substring(
                39
              )} is Not a contract address`,
            ]);
          } else {
            setIsContract(true);
            setLogger([
              ...logger,
              `${token.substring(0, 6)}...${token.substring(
                39
              )} is a contract address`,
            ]);
          }
        })
        .catch(ErrorToConsole);
    } else if (token === '0x') {
      return;
    } else {
      setIsContract(false);
    }
  }, [token]);

  function ErrorToConsole(log: string) {
    setLogger([...logger, log]);
    return log;
  }

  return (
    <>
      <div className="App h-[650px] rounded-lg flex">
        <XIcon
          className="absolute  top-0 right-0 h-7 text-gray-900 cursor-pointer"
          onClick={() => {
            ipcRenderer.send('close-me');
          }}
        />
        <MinusSmIcon
          className="absolute  -top-1 right-10 h-8 text-gray-900 cursor-pointer"
          onClick={() => {
            ipcRenderer.send('minimize-me');
          }}
        />
        <div className=" space-y-3 relative">
          <div className="ml-3 drag">
            <Dragable />
          </div>
          <div>
            <div className="text-[.85em] pointer-events-none absolute right-4 space-x-1 flex items-center">
              <img className="h-7" src={bnb} alt="bnb" />
              <h1>{balance}</h1>
              {balance !== 'Enter private key' ? <h1>BNB</h1> : null}
            </div>
            {}
          </div>

          <div className="pl-14">
            <h1 className="pointer-events-none">Private Key</h1>
            <div className="flex items-center relative space-x-2 bg-sky-400 w-fit px-4 py-2 rounded-3xl">
              <input
                className="bg-sky-400   placeholder-white text-white outline-none"
                placeholder="private key"
                type="password"
                value={privateKey}
                onChange={(e) => {
                  setPrivateKey(e.target.value);
                  if (e.target.value.length === 66) {
                    if (e.target.value.startsWith('0x')) {
                      setAddress(
                        web3.eth.accounts.privateKeyToAccount(e.target.value)
                          .address
                      );
                      setLogger([
                        ...logger,
                        `Address was set to ${web3.eth.accounts
                          .privateKeyToAccount(e.target.value)
                          .address.substring(0, 6)}...`,
                      ]);
                      getTransactionCount(
                        web3.eth.accounts.privateKeyToAccount(e.target.value)
                          .address
                      )
                        .then((result: number) => {
                          console.log(result);
                          setNonce(result);
                          setLogger([...logger, `nonce was set to ${result}`]);
                        })
                        .catch(ErrorToConsole);
                    } else {
                      setLogger([
                        ...logger,
                        'Invalid private key, make sure your private key starts with 0x',
                      ]);
                    }
                  } else {
                    setAddress('0x');
                  }
                }}
              />
            </div>
          </div>
          <div className="pl-14 pt-4 flex justify-between items-center space-y-4">
            <div>
              <h1 className="pointer-events-none">Choose Dex</h1>
              <div className="flex relative items-center space-x-2 bg-sky-400 w-fit px-4 py-2 rounded-3xl">
                <img src={pancake} alt="pancake" />
                <div
                  className="absolute right-3 leading-[0] text-[0.7em] cursor-pointer -top-4 flex items-center bg-white rounded-md p-1 shadow-md shadow-gray-500"
                  onClick={() => {
                    if (network === 'Testnet') {
                      //swith to mainnet onclick if it's testnet
                      setNetwork('Mainnet');
                      setChainId(56);
                      setPancakeContractAddress(
                        '0x10ed43c718714eb63d5aa57b78b54704e256024e'
                      );
                      setWbnbAddress(
                        '0xbb4cdb9cbd36b01bd1cbaebf2de08d9173bc095c'
                      );
                      setLogger([...logger, `Set to mainnet`]);
                    } else {
                      //opposite
                      setNetwork('Testnet');
                      setChainId(97);
                      setPancakeContractAddress(
                        '0x9ac64cc6e4415144c455bd8e4837fea55603e5c3'
                      );
                      setWbnbAddress(
                        '0xae13d989dac2f0debff460ac112a837c89baa7cd'
                      );
                      setLogger([...logger, `Set to testnet`]);
                    }
                  }}
                >
                  <p className="">{network}</p>
                  <SwitchHorizontalIcon className="h-[1em]" />
                </div>

                <p className="text-white pointer-events-none">PancakeSwap</p>
              </div>
            </div>
          </div>
          <div className="pl-14 pt-4 space-x-4 flex ">
            <div>
              <h1 className="pointer-events-none">Token Address</h1>
              <div
                className={`flex items-center space-x-2 bg-sky-400 w-fit px-4 py-2 rounded-3xl  ${
                  isContract !== false ? '' : 'border border-red-500'
                }`}
              >
                <input
                  className={`bg-sky-400 placeholder-white text-white outline-none`}
                  placeholder="token"
                  onBlur={(e) => {
                    setToken(e.target.value);
                  }}
                />
              </div>
            </div>
            <div>
              <h1 className="pointer-events-none">Amount</h1>
              <div className="flex items-center relative space-x-2 bg-sky-400 w-fit px-4 py-2 rounded-3xl">
                <input
                  className="bg-sky-400   placeholder-white text-white outline-none"
                  placeholder="Amount"
                  type="number"
                  onBlur={(e) => {
                    setAmount(e.target.value);
                  }}
                />
                <span className="w-[2px] right-14 absolute h-10 bg-white">
                  {' '}
                </span>
                <p className="right-4 top-2 absolute h-10 text-white">BNB</p>
              </div>
            </div>
          </div>
          <div className="pl-14 pt-4 flex space-x-6 items-end">
            <div>
              <h1 className="pointer-events-none">Slippage</h1>
              <div className="flex items-center relative space-x-2 bg-sky-400 w-fit px-4 py-2 rounded-3xl">
                <input
                  type="number"
                  className="bg-sky-400   placeholder-white text-white outline-none"
                  placeholder="Slippage"
                  onBlur={(e) => {
                    setSlippage(parseInt(e.target.value));
                    setLogger([
                      ...logger,
                      `Slippage was set to ${e.target.value}`,
                    ]);
                    console.log(slippage);
                  }}
                />
                <span className="w-[2px] right-14 absolute h-10 bg-white">
                  {' '}
                </span>
                <p className="right-4 top-2 absolute h-10 text-white">%</p>
              </div>
            </div>
            <div>
              <h1 className="pointer-events-none whitespace-nowrap">
                Transaction type
              </h1>
              <div className="flex">
                <button
                  type="button"
                  className={`h-10 transition-[transform] text-white rounded-l-3xl px-4 ${
                    txType === 'buy' ? 'bg-blue-800 scale-105' : 'bg-sky-400'
                  }`}
                  onClick={() => {
                    setTxType('buy');
                  }}
                >
                  Buy
                </button>
                <span className="bg-white  h-10 w-1" />
                <button
                  type="button"
                  className={`h-10 transition-[transform] text-white rounded-r-3xl px-4 ${
                    txType === 'sell' ? 'bg-blue-800 scale-105' : 'bg-sky-400'
                  }`}
                  onClick={() => {
                    setTxType('sell');
                  }}
                >
                  Sell
                </button>
              </div>
            </div>
            <div>
              <p>safe mode</p>
              <Toggle />
            </div>
          </div>
          <div className="pl-14 pt-4 flex space-x-6 items-end">
            <div>
              <h1 className="pointer-events-none">Target Stop loss</h1>
              <div className="flex items-center relative space-x-2 bg-sky-400 w-fit px-4 py-2 rounded-3xl">
                <input
                  className="bg-sky-400   placeholder-white text-white outline-none"
                  placeholder="Target Stop loss"
                  type="number"
                />
                <span className="w-[2px] right-14 absolute h-10 bg-white">
                  {' '}
                </span>
                <p className="right-4 top-2 absolute h-10 text-white">%</p>
              </div>
            </div>
            <div>
              <h1 className="pointer-events-none">Deadline</h1>
              <div className="flex items-center relative space-x-2 bg-sky-400 w-fit px-4 py-2 rounded-3xl">
                <input
                  className="bg-sky-400   placeholder-white text-white outline-none"
                  placeholder="Deadline"
                  type="number"
                />
                <span className="w-[2px] right-14 absolute h-10 bg-white">
                  {' '}
                </span>
                <p className="right-4 top-2 absolute h-10 text-white">SEC</p>
              </div>
            </div>
          </div>
          <div className="pl-14 pt-4 flex space-x-6 items-end">
            <div className="">
              <h1 className="pointer-events-none">Gas Price</h1>
              <div className="flex items-center relative space-x-2 bg-sky-400  px-4 py-2 rounded-3xl">
                <input
                  className="bg-sky-400 w-28  placeholder-white text-white outline-none"
                  placeholder="Gas price"
                  type="number"
                  value={gasPrice}
                  onChange={(e) => {
                    setGasPrice(parseInt(e.target.value) * 1000000000);
                  }}
                  onBlur={(e) => {
                    setLogger([
                      ...logger,
                      `Gas price was set to ${e.target.value}`,
                    ]);
                  }}
                />
                <span className="w-[2px] right-12 absolute h-10 bg-white">
                  {' '}
                </span>
                <p className="right-2 top-2 absolute h-10 text-white">Gwei</p>
              </div>
            </div>
            <div>
              <h1 className="pointer-events-none">Gas limit</h1>
              <div className="flex items-center relative space-x-2 bg-sky-400 px-4 py-2 rounded-3xl">
                <input
                  className="bg-sky-400 w-28 placeholder-white text-white outline-none"
                  placeholder="Gas limit"
                  type="number"
                  value={gasLimit}
                  onChange={(e) => {
                    setGasLimit(parseInt(e.target.value));
                  }}
                  onBlur={(e) => {
                    setLogger([
                      ...logger,
                      `gas limit was set to ${e.target.value}`,
                    ]);
                  }}
                />
                <span className="w-[2px] right-12 absolute h-10 bg-white">
                  {' '}
                </span>
                <p className="right-2 top-2 absolute h-10 text-white">Gwei</p>
              </div>
            </div>
            <div>
              <h1 className="pointer-events-none">Iterations</h1>
              <div className="flex items-center relative space-x-2 bg-sky-400 px-4 py-2 rounded-3xl">
                <input
                  className="bg-sky-400 w-28  placeholder-white text-white outline-none"
                  placeholder="Iterations"
                  type="number"
                />
                <p className="right-3 top-2 absolute h-10 text-white"> </p>
              </div>
            </div>
          </div>

          <div className="w-full flex justify-end  items-center px-5">
            <img
              className="p-3 w-14 shadow-md shadow-blue-600 cursor-pointer bg-gray-100 hover:scale-110 transition-[transform] hover:bg-sky-500 text-white rounded-full"
              onClick={async () => {
                let amountsout = await pancakeContract.methods
                  .getAmountsOut(web3.utils.toWei(amount, 'ether'), [
                    wbnbAddress,
                    token,
                  ])
                  .call({});
                amountsout = BigInt(
                  Math.round(amountsout[1] - (amountsout[1] * slippage) / 100)
                ).toString();
                console.log(amountsout);
                await pancakeContract.methods
                  .swapExactETHForTokens(
                    amountsout,
                    [wbnbAddress, token],
                    address,
                    Math.round(
                      new Date(new Date().getTime() + 1200 * 1000).getTime() /
                        1000
                    )
                  )
                  .estimateGas({
                    from: address,
                    gas: gasLimit,
                    value: web3.utils.toHex(web3.utils.toWei(amount, 'ether')),
                  })
                  .then((gasAmount: string) => {
                    txParams!.data = pancakeContract.methods
                      .swapExactETHForTokens(
                        amountsout,
                        [wbnbAddress, token],
                        address,
                        Math.round(
                          new Date(
                            new Date().getTime() + 1200 * 1000
                          ).getTime() / 1000
                        )
                      )
                      .encodeABI();
                    console.log(gasAmount);
                    return gasAmount;
                  })
                  .catch(ErrorToConsole);
                console.log(txParams);
                web3.eth.accounts
                  .signTransaction(txParams!, privateKey)
                  .then((signedTx: SignedTransaction) => {
                    console.log(signedTx);
                    web3.eth
                      .sendSignedTransaction(signedTx.rawTransaction!)
                      .then((transactionHash) => {
                        console.log(transactionHash);
                        setNonce(nonce + 1);
                      })
                      .catch(ErrorToConsole);
                  })
                  .catch(ErrorToConsole);
              }}
              src={snipe}
            />
            {/* <button
              type="button"
              onClick={async () => {
                // var tokenContract = new web3.eth.Contract(
                //   ABI,
                //   '0x7ef95a0FEE0Dd31b22626fA2e10Ee6A223F8a684'
                // );
                // const symbol = await tokenContract.methods.symbol().call();
                // const decimals = await tokenContract.methods.decimals().call();
                // const name = await tokenContract.methods.name().call();
                // const balance = await tokenContract.methods
                //   .balanceOf(address)
                //   .call();
                // console.log(symbol, decimals, name, balance);
              }}
            >
              HELLO
            </button> */}
          </div>
        </div>
        <Console logger={logger} setLogger={setLogger} />
      </div>
    </>
  );
}
