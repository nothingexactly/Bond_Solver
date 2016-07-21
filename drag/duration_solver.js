/* 
 * DURATION OBJECT
 *
 * depends on autodifferentiation.js
 */


function Duration(price,coupon_value,years_to_maturity,par_value) {
       this.c = coupon_value; 
       this.n = years_to_maturity;
       this.m = par_value;
       this.pv = price;         // pv for Present Value

       this.AD = new AutoDiff();    // Auto-differentiation object 
      
       // To find the modified duration:
       //   a) find the yield to maturity (ytm)
       //         i) use Newton-Raphson gradient descent with
       //            first derivatives calculated using Auto-differentiation
          
       //   b) use the ytm to find the Macaulay duration 
       //   c) use the Macaulay duration to find the Modified Duration
       
       this.ytm = 0;
       this.macD = 0;
       this.modD = 0;

       this.newtonSolve(10);
      
       console.log(this.ytm);

       this.macaulayDuration();

       console.log(this.macD);

       this.modifiedDuration(); 

       console.log(this.modD);
}

// evaluates YTM function and its first derivative
// at the given i using automatic differentiation

Duration.prototype.evaluateYTM = function (i) {
	// m and c and pv do not necessarily need to be Duals
  	i = Dual(i,1);
	var evaluation = this.AD.div(Dual(this.m),this.AD.pow(this.AD.add(Dual(1),i),Dual(this.n)));	
	for (var k = 1 ; k <= this.n ; k++) {
		this.AD.addAssign(evaluation,this.AD.div(Dual(this.c),this.AD.pow(this.AD.add(Dual(1),i),Dual(k))));
	}
	this.AD.subAssign(evaluation,Dual(this.pv));

	return evaluation;
}

// Uses Newton-Raphson to solve for the Yield to Maturity
Duration.prototype.newtonSolve = function (maxIter) {
    
	// best initial value for i is 0	
	var i = 0;
	if (this.c * this.n + this.m < this.pv) throw "Impossible parameters";

	for (var k = 0 ; k < maxIter ; k++) {
		var temp = this.evaluateYTM(i); // evaluate the derivative at this 'i'

    /*
         dy / dx = f'(x)
         (f(x_i) - f(x_i+1)) / (x_i - x_i+1) = f'(x_i)         
         
         dy == f(x_i) because we want f(x_i+1) to be 0
         
         then rearrange as an expression in terms of x_i+1

         x_i+1 = x_i - f(x_i) / f'(x_i)
     */

		i = i - temp.a / temp.b;	

		if (!isFinite(i)) throw "In newton(), i is not finite";		
	}	

    this.ytm = i;

	return i;
}

Duration.prototype.macaulayDuration = function () {
            // where most likely we use i == ytm, pv == bond_price
            var sum = this.m * this.n / Math.pow(1 + this.ytm, this.n);    
            
            // checking against http://www.mrzeno.com/Bond-Macaulay-Duration-Convexity.php
            // mrzeno.com doesn't include the final maturity value, to which sum is initialized
            // here, in the summation

            for (var k = 1 ; k <= this.n ; k++) {
                sum += this.c * k / Math.pow(1 + this.ytm, k);
            }
            sum /= this.pv;
            this.macD = sum;
            return this.macD;
}

Duration.prototype.modifiedDuration = function () {
            this.modD = this.macD/(1+this.ytm/this.n);
            return this.modD;
}

// I wonder if this is kind of redundant
Duration.prototype.checkConvergence = function () {
            // n is the number of years
            var sum = this.m / Math.pow(1 + this.ytm, this.n); // account for redeption payment 
            
            for (var k = 1 ; k <= this.n ; k++) {
                sum += this.c / Math.pow(1 + this.ytm,k); 
            }

            sum -= this.pv; // with pv moved to the other side, we want sum to equal 0	
            
            return sum;
}

