
export class Summary {
    private count: number = 0;
    private sum: number = 0;
    private min: number = 0;
    private max:number=0;
    private avg: number = 0;
    private numbers: number[] = [];

    setNumbers(numbers:number[]){
        this.numbers=numbers;
        this.count=this.numbers.length;
    }



    getSum() {
        this.sum=0;
        this.avg=0;
        for(let i=0;i<this.numbers.length;i++) this.sum+=this.numbers[i]!;
        this.avg=(this.sum/this.numbers.length);
        
    }

    findMin(){
        this.min=Number.MAX_SAFE_INTEGER;
        let minimum=Number.MAX_SAFE_INTEGER;
        for(let i=0;i<this.numbers.length;i++){
            minimum=Math.min(minimum,this.numbers[i]!);
        }
        if(minimum==Number.MAX_SAFE_INTEGER){
            this.min=0;
        }
        else this.min=minimum;
        
    }

    findMax(){
        this.max=0
        let maximum=0;
        for(let i=0;i<this.numbers.length;i++){
            maximum=Math.max(maximum,this.numbers[i]!)
        }
        this.max=maximum;
    }

    displaySummary(numbers:number[]){
        this.setNumbers(numbers);
        const {count,min,max,sum,avg}=this.getSummary();
        const summaryBox=document.getElementById("summary")!
        summaryBox.innerHTML=`<span id="count">Count: ${count}</span>
        <span id="min">Minimum: ${min==Number.MIN_VALUE ? 'NA' : min}</span>
        <span id="max">Maximum: ${max==Number.MAX_SAFE_INTEGER ? 'NA' : max}</span>
        <span id="avg">Avg: ${avg.toPrecision(6)}</span>
        <span id="max">Sum: ${sum}</span>`
    }

    getSummary(){
        this.findMax();
        this.findMin();
        this.getSum();
        return{
            count:this.count,
            min:this.min,
            max:this.max,
            sum:this.sum,
            avg:this.avg
        }
    }
}

