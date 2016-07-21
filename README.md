## Synopsis

This program works out the Macaulay Duration and Modified duration for a bond of price $100, and remaining parameters specified by user input. 

Finding the Yield to Maturity, which leads to the calculation of Duration, requires a solver. This program implements a Newton-Raphson gradient descent method where first derivatives are calculated using a simple implementation of automatic differentiation.

## Motivation

* To learn about Automatic Differentiation
* To learn some d3.js for interactive visualisation
* To use Automatic Differentiation instead of the secant method for Newton-Raphson 

## Thoughts

The UI is built using d3.js. And the code possibly reveals where d3's data binding paradigm is not so well suited to UI design as it is to data visualisation.

d4's approach may be a suitable alternative <https://d4.js.org/>

Using redux with d3 <https://twitter.com/tonyhschu/status/732058196622245888>

Using higher order functions to generate d3 drag behaviours

## References

This adapts <https://github.com/ehaas/js-autodiff>

Jamey Sharp introduced me to Automatic differentiation and helped with the adaptation of the AD object from ehaas.

<https://github.com/jameysharp>
