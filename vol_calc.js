// this is messed up encapsulation
function YTM() {
    console.log("YTM object instantiated");
}

YTM.prototype.Dual = function (a, b) {
    if (!isFinite(a)) throw "a is not finite";
    if (!isFinite(b || 0)) throw "b is not finite";
    return {a: a, b: b || 0};
}

// automatic differentiation
YTM.prototype.AD = {
    pow: function(f,g) {
        return Dual(Math.pow(f.a,g.a),Math.pow(f.a,g.a)*(f.b*g.a/f.a+g.b*Math.log(f.a)));
    },	
    neg: function(x) {
        return Dual(-x.a, -x.b);
    },
    incr: function(x) {
        ++x.a;
    },
    decr: function(x) {
        --x.a;
    },
    gt: function(x0, x1) {
        return x0.a > x1.a;
    },
    gte: function(x0, x1) {
        return x0.a >= x1.a;
    },
    lt: function(x0, x1) {
        return x0.a < x1.a;
    },
    lte: function(x0, x1) {
        return x0.a <= x1.a;
    },
    eq: function(x0, x1) {
        return x0.a == x1.a;
    },
    add: function(x0, x1) {
        return Dual(x0.a + x1.a, x0.b + x1.b);
    },
    sub: function(x0, x1) {
        return Dual(x0.a - x1.a, x0.b - x1.b);
    },
    mul: function(x0, x1) {
        return Dual(x0.a * x1.a, x0.a * x1.b + x1.a * x0.b);
    },
    div: function(x0, x1) {
        return Dual(x0.a / x1.a, (x1.a * x0.b - x0.a * x1.b) / (x1.a * x1.a));
    },
    addAssign: function(x0, x1) {
        var sum = AD.add(x0, x1);
        x0.a = sum.a;
        x0.b = sum.b;
    },
    subAssign: function(x0, x1) {
        var diff = AD.sub(x0, x1);
        x0.a = diff.a;
        x0.b = diff.b;
    },
    mulAssign: function(x0, x1) {
        var prod = AD.mul(x0, x1);
        x0.a = prod.a;
        x0.b = prod.b;
    },
    divAssign: function(x0, x1) {
        var quot = AD.div(x0, x1);
        x0.a = quot.a;
        x0.b = quot.b;
    },
    sqrt: function(x) {
        return Dual(Math.sqrt(x.a), x.b * 0.5 / Math.sqrt(x.a));
    },
    sin: function(x) {
        return Dual(Math.sin(x.a), x.b * Math.cos(x.a));
    },
    cos: function(x) {
        return Dual(Math.cos(x.a), -x.b * Math.sin(x.a));
    },
    tan: function(x) {
        return Dual(Math.tan(x.a), x.b / (Math.cos(x.a) * Math.cos(x.a)));
    },
    asin: function(x) {
        return Dual(Math.asin(x.a), x.b / Math.sqrt(1 - x.a * x.a));
    },
    acos: function(x) {
        return Dual(Math.acos(x.a), -x.b / Math.sqrt(1 - x.a * x.a));
    },
    atan: function(x) {
        return Dual(Math.atan(x.a), x.b / (1 + x.a * x.a));
    },
    log: function(x) {
        return Dual(Math.log(x.a), x.b / x.a);
    },
    exp: function(x) {
        return Dual(Math.exp(x.a), x.b * Math.exp(x.a));
    },
    abs: function(x) {
        var b;
        if (x.a > 0) {
            b = 1;
        } else if (x.a < 0) {
            b = -1;
        } else {
            b = NaN;
        }
        return Dual(Math.abs(x.a), x.b * b);
    },
    PI: {a: Math.PI,b: 0},
    E: {a: Math.E,b: 0},
    LOG2E: {a: Math.LOG2E,b: 0},
    LN2: {a: Math.LN2,b: 0},
    LN10: {a: Math.LN10,b: 0},
    LOG10E: {a: Math.LOG10E,b: 0},
    SQRT2: {a: Math.SQRT2,b: 0},
    SQRT1_2: {a: Math.SQRT1_2,b: 0}
}

// evaluates the derivative of our YTM function
// at the given i using automatic differentiation
YTM.prototype.ytm = function (i,pv,c,n,m) {
    // m and c and pv do not necessarily need to be Duals

    i = Dual(i,1);
    var func = AD.div(Dual(m),AD.pow(AD.add(Dual(1),i),Dual(n)));	
    for (var k = 1 ; k <= n ; k++) {
        AD.addAssign(func,AD.div(Dual(c),AD.pow(AD.add(Dual(1),i),Dual(k))));
    }
    AD.subAssign(func,Dual(pv));

    return func;
 }

YTM.prototype.newton = function (maxIter,pv,c,n,m) {
    // best initial value for i is 0	
    var i = 0;
    if (c*n + m < pv) throw "Impossible parameters";

    for (var k = 0 ; k < maxIter ; k++) {
        var temp = this.ytm(i,pv,c,n,m);
        i = i - temp.a / temp.b;	
        if (!isFinite(i)) throw "In newton(), i is not finite";		
    }	
    return i;
}

