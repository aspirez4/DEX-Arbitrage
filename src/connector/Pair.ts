type Optional = BigNumber | undefined;
import BigNumber from "bignumber.js";

import { ETHEREUM } from './Connector';
const PAIR_SEPARATOR = '/';

class Pair{


    private _buyRate?: Optional
    private _sellRate?: Optional
    private _rateDate?: Optional
    private _ethereumReplacement?: string;

    constructor(private _tokens: [string, string], private _decimals: [number, number], private _name: string, private _volume: number  ){

    }


    get firstTokenDecimals(){
        return this._decimals[0];
    }

    get secondTokenDecimals(){
        return this._decimals[1];
    }



    /**
     * Если на бирже используется заменя для ethereum, возвращать этот токен вместо эфира
    * */
    set ethereumReplacement(tokenAddr: string){
        this._ethereumReplacement = tokenAddr;
    }

    get tokens(){
        return [this.firstToken, this.secondToken];
    }

    get firstToken(){
        const isEth = this._tokens[0] === ETHEREUM;
        return isEth && this._ethereumReplacement ?  this._ethereumReplacement : this._tokens[0];
    }

    get secondToken(){
        const isEth = this._tokens[1] === ETHEREUM;
        return isEth && this._ethereumReplacement ?  this._ethereumReplacement : this._tokens[1];
    }

    get volume(){
        return this._volume;
    }

    get name(): string{
        return this._name;
    }

    get sellRate(): Optional{
        return this._sellRate;
    }


    set sellRate(value: Optional) {
        this._sellRate = value;
    }


    get buyRate(): Optional {
        return this._buyRate;
    }

    set buyRate(value: Optional) {
        this._buyRate = value;
    }

    get rateDate(): Optional {
        return this._rateDate;
    }

    getCopy(): Pair{
        const copy = new (this.constructor as { new (): Pair })();
        Object.assign(copy, this);
        return copy;
    }


    public getTokenNames() {
        return this.name.split(PAIR_SEPARATOR);
    }

}

export default Pair;
