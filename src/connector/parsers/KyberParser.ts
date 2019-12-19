import AbstractParser from "../AbstractParser";
import Pair from "../Pair";
import Web3 from "web3";
import ABI from "./../../ABI/kyberAbi.json";
import config from "./../../../app-config.json";
import RatesResult from "../RatesResult";
import {ETHEREUM} from "../Connector";
const BigNumber = require('bignumber.js');

const provider: string = config.ethereumProvider;

const web3 = new Web3(provider);
// const WETH_ADDR = '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2';

const KyberAddr = config.contractsAddrs.kyber;

export default class KyberParser extends AbstractParser {
    dexName = 'Kyber';
    contractAddr = KyberAddr;
    private dexContract: any;


    constructor(pairs: Pair[]) {
        super(pairs)

        // @ts-ignore
        this.dexContract = new web3.eth.Contract(ABI, this.contractAddr);

    }

    async getRates(): Promise<Pair[]> {
        let res: Pair[] = [];
        for (let pair of this.pairs) {
            try{
                const rate = await this.getRateForPair(pair);
                res.push(rate)
            }catch (e) {
                console.log(`Error parsing ${pair} on ${this.dexName}`)
                console.log(e.message)
            }

        }

        return res;
    }

    private async getRateForPair(pair: Pair): Promise<Pair> {

        const pairClone: Pair = pair.getCopy();

        // Init
        const [firstToken, secondToken] = pair.tokens;
        const [firstTokenName, secondTokenName] = pair.getTokenNames();
        const hasEthereum = firstToken === ETHEREUM || secondToken === ETHEREUM;

        let firstTokenVolume: number;
        let secondTokenVolume: number;


        // Get volumes from dollars
        try {
            firstTokenVolume = await this.getVolumeForToken(firstTokenName, pair.volume)
            secondTokenVolume = await this.getVolumeForToken(secondTokenName, pair.volume)
        } catch (e) {

            console.log(e.message);
            return  pair;
        }

        console.log("firstTokenVolume ", firstTokenVolume);
        console.log("secondTokenVolume ", firstTokenVolume);
        console.log("firstToken ", firstToken);
        console.log("secondToken ", secondToken);

        let firstTokenVolumeInteger = BigNumber(firstTokenVolume.toFixed(pair.firstTokenDecimals)).times(Math.pow(10, pair.firstTokenDecimals));
        let firstTokenVolumeIntegerWeb3 = web3.utils.toBN(firstTokenVolumeInteger);


        let secondTokenVolumeInteger = BigNumber(secondTokenVolume.toFixed(pair.secondTokenDecimals)).times(Math.pow(10, pair.secondTokenDecimals));
        let secondTokenVolumeIntegerWeb3 = web3.utils.toBN(secondTokenVolumeInteger);


        let sellRate: any;
        let buyRate: any;

        if (hasEthereum) {
            sellRate = undefined
            buyRate = undefined
        } else {
            const buyResult: any = await this.dexContract.methods.getExpectedRate(secondToken, firstToken, secondTokenVolumeIntegerWeb3.toString()).call();
            const buyResultBN = BigNumber(buyResult.expectedRate);
            buyRate = BigNumber(1).div(buyResultBN.div(Math.pow(10, 18)))
            console.log("buyResultFinish ", BigNumber(buyRate).toFixed(6))

            let sellResult: any = await this.dexContract.methods.getExpectedRate(firstToken, secondToken, firstTokenVolumeIntegerWeb3.toString()).call();
            const sellResultBN = BigNumber(sellResult.expectedRate).div(Math.pow(10, 18));
            sellRate = sellResultBN;
            console.log("sellResult: ", sellResultBN.toFixed(6));
        }



        pairClone.buyRate = buyRate;
        pairClone.sellRate = sellRate;

        return pairClone;
    }





}

