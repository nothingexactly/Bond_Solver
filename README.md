## Synopsis

[Try it out here](https://cbrookhouse8.github.io/Bonds_Auto_Differentiation/)

This program calculates how sensitive the price of a given bonds is to changes in interest rates.

It also provides a user interface through which you can compare bonds of varying price, term to maturity, and coupon rate. 

The aim of this program is to provide an intuition for how risky a bond might be based on the aforementioned parameters.

Finding the Yield to Maturity, which leads to the calculation of Duration, requires a solver. This program implements a Newton-Raphson gradient descent method where first derivatives are calculated using a simple implementation of automatic differentiation.

## Instructions

The the graph displays bonds as points wich corresponding arcs. The radius of the arc represents the Price of the Bond. The horizontal position of the point that is the centre of the arc corresponds to the remaining years until maturity. The Vertical axis corresponds to the Coupon rate of the Bond (the proportion paid of the par value each year).

Each bond can be manipulated by dragging with your mouse either the arc (to change the price) or the grey point (to change the coupon rate or term to maturity):

<img src="./drag_behaviours.png" alt="ellipsoid" width="300px"/>

Below the bonds there is a horizontal bar chart. Each bar represents the price sensitivity of the bond of corresponding colour in the top chart. 

The **Modified Duration (%)** metric refers to the approximate change in price of each bond that could be expected for a 1% change in interest rates.

Crucially, bond prices move inversly to interest rates. So an increase in interest rates causes a decrease in bond prices.

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
