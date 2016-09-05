## Synopsis

[Try it out here](https://cbrookhouse8.github.io/Bonds_Auto_Differentiation/)

This program calculates how sensitive the price of a given bonds is to changes in interest rates.

It also provides a user interface through which you can compare bonds of varying price, term to maturity, and coupon rate. 

The aim of this program is to provide an intuition for how risky a bond might be based on the aforementioned parameters.

Finding the Yield to Maturity, which leads to the calculation of Duration, requires a solver. This program implements a Newton-Raphson gradient descent method where first derivatives are calculated using a simple implementation of automatic differentiation.

## Instructions

Each point-arc represents a bond where the radius of the arc is the *price* of the bond, and the xy-position of the bond its *Term to Maturity* and *Coupon Rate*

**Drag behaviours:i**

<img src="./drag_behaviours.png" alt="ellipsoid" width="300px"/>

## Motivation

* To use visualisation to communicate useful technical ideas to a lay audience
* To implement the Newton-Raphson Gradient Descent using Automatic Differentiation
* To become familiar with d3's data-binding paradigm: its limitations and possibilities

## Reflections

The Horizontal axis is really discrete. However, this user interface fails to convey this adequately. The program can only work with whole number values for the term to maturity.

The UI is built using d3.js. And the code possibly reveals where d3's data binding paradigm is not so well suited to UI design as it is to data visualisation.

d4's approach may be a suitable alternative <https://d4.js.org/>

Using redux with d3 <https://twitter.com/tonyhschu/status/732058196622245888>

Using higher order functions to generate d3 drag behaviours

## References

This adapts <https://github.com/ehaas/js-autodiff>

Jamey Sharp introduced me to Automatic differentiation and helped with the adaptation of the AD object from ehaas.

<https://github.com/jameysharp>
