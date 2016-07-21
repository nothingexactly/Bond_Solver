// where presentValue may be something other than price
// Sometimes Present Value is taken to just be price
function presentValue(interest_rate,coupon_value,years_to_maturity,par_value) {
    var sum = par_value / Math.pow(1 + interest-rate,years_to_maturity);
    for (var k = 1 ; k <= years_to_maturity ; k++) {
        sum += coupon_value / Math.pow(1 + interst_rate, k);
    }
    return sum;
}

function Dual(a, b) {
	if (!isFinite(a)) throw "a is not finite";
	if (!isFinite(b || 0)) throw "b is not finite";
	return {a: a, b: b || 0};
}

function AutoDiff() {

    console.log("Construct a new AutoDiff object");

	this.pow = function(f,g) {
		return Dual(Math.pow(f.a,g.a),Math.pow(f.a,g.a)*(f.b*g.a/f.a+g.b*Math.log(f.a)));
	}	

	this.neg = function(x) {
		return Dual(-x.a, -x.b);
	}
	
    this.incr = function(x) {
		++x.a;
	}
	
    this.decr = function(x) {
		--x.a;
	}
	
    this.gt = function(x0, x1) {
		return x0.a > x1.a;
	}
	
    this.gte = function(x0, x1) {
		return x0.a >= x1.a;
	}
    
    this.lt = function(x0, x1) {
		return x0.a < x1.a;
	}
	
    this.lte = function(x0, x1) {
		return x0.a <= x1.a;
	}
	
    this.eq = function(x0, x1) {
		return x0.a == x1.a;
	}
	
    this.add = function(x0, x1) {
		return Dual(x0.a + x1.a, x0.b + x1.b);
	}
	
    this.sub = function(x0, x1) {
		return Dual(x0.a - x1.a, x0.b - x1.b);
	}
	
    this.mul = function(x0, x1) {
		return Dual(x0.a * x1.a, x0.a * x1.b + x1.a * x0.b);
	}
	
    this.div = function(x0, x1) {
		return Dual(x0.a / x1.a, (x1.a * x0.b - x0.a * x1.b) / (x1.a * x1.a));
	}
	
    this.addAssign = function(x0, x1) {
		var sum = this.add(x0, x1);
		x0.a = sum.a;
		x0.b = sum.b;
	}
	
    this.subAssign = function(x0, x1) {
		var diff = this.sub(x0, x1);
		x0.a = diff.a;
		x0.b = diff.b;
	}
	
    this.mulAssign = function(x0, x1) {
		var prod = this.mul(x0, x1);
		x0.a = prod.a;
		x0.b = prod.b;
	}
	
    this.divAssign = function(x0, x1) {
		var quot = this.div(x0, x1);
		x0.a = quot.a;
		x0.b = quot.b;
	}
	
    this.sqrt = function(x) {
		return Dual(Math.sqrt(x.a), x.b * 0.5 / Math.sqrt(x.a));
	}
	
    this.sin = function(x) {
		return Dual(Math.sin(x.a), x.b * Math.cos(x.a));
	}
	
    this.cos = function(x) {
		return Dual(Math.cos(x.a), -x.b * Math.sin(x.a));
	}
	
    this.tan = function(x) {
		return Dual(Math.tan(x.a), x.b / (Math.cos(x.a) * Math.cos(x.a)));
	}
	
    this.asin = function(x) {
		return Dual(Math.asin(x.a), x.b / Math.sqrt(1 - x.a * x.a));
	}
	
    this.acos = function(x) {
		return Dual(Math.acos(x.a), -x.b / Math.sqrt(1 - x.a * x.a));
	}
	
    this.atan = function(x) {
		return Dual(Math.atan(x.a), x.b / (1 + x.a * x.a));
	}

	this.log = function(x) {
		return Dual(Math.log(x.a), x.b / x.a);
	}

	this.exp = function(x) {
		return Dual(Math.exp(x.a), x.b * Math.exp(x.a));
	}

	this.abs = function(x) {
		var b;
		if (x.a > 0) {
			b = 1;
		} else if (x.a < 0) {
			b = -1;
		} else {
			b = NaN;
		}
		return Dual(Math.abs(x.a), x.b * b);
	}

	this.PI = Dual(Math.PI);
	this.E = Dual(Math.E);
	this.LOG2E = Dual(Math.LOG2E);
	this.LN2 = Dual(Math.LN2);
	this.LN10 = Dual(Math.LN10);
	this.LOG10E = Dual(Math.LOG10E);
	this.SQRT2 = Dual(Math.SQRT2);
	this.SQRT1_2 = Dual(Math.SQRT1_2);
}

// evaluates the derivative of our YTM function
// at the given i using automatic differentiation
// pv can be bond price or an esimation of market price
// based on market interest rates (check this)
function ytm(i,pv,c,n,m,auto_differ) {
	// m and c and pv do not necessarily need to be Duals
    var AD = auto_differ; 

	i = Dual(i,1);
	var func = AD.div(Dual(m),AD.pow(AD.add(Dual(1),i),Dual(n)));	
	for (var k = 1 ; k <= n ; k++) {
		AD.addAssign(func,AD.div(Dual(c),AD.pow(AD.add(Dual(1),i),Dual(k))));
	}
	AD.subAssign(func,Dual(pv));

	return func;
}

function newton(maxIter,pv,c,n,m) {
	// best initial value for i is 0	
	var i = 0;
	if (c*n + m < pv) throw "Impossible parameters";
    var ad = new AutoDiff();
	for (var k = 0 ; k < maxIter ; k++) {
		var temp = ytm(i,pv,c,n,m,ad); // evaluate the derivative at this 'i'

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
	return i;
}

function checkConvergence(i,pv,c,n,m) {
    // n is the number of years
	var sum = m / Math.pow(1 + i, n); // account for redeption payment 
    
	for (var k = 1 ; k <= n ; k++) {
        sum += c / Math.pow(1 + i,k); 
	}

    sum -= pv; // with pv moved to the other side, we want sum to equal 0	
    
    return sum;
}

function macaulayDuration(i,pv,c,n,m) {
    // where most likely we use i == ytm, pv == bond_price
    var sum = m * n / Math.pow(1 + i, n);    
    for (var k = 1 ; k <= n ; k++) {
        sum += c * k / Math.pow(1 + i, k);
    }
    sum /= pv;
    return sum;
}

function modifiedDuration(yield_to_maturity,macD,years) {
    return macD / (1 + yield_to_maturity/years);
}

