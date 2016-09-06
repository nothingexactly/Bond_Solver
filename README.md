## Synopsis

An finance-inspired exercise in visualisation and numerical methods.

[Try it out here](https://cbrookhouse8.github.io/Bonds_Auto_Differentiation/)

This program estimates the sensitivities of the prices of given bonds to changes in market interest rates based on a model of 'modified duration'.

Roughly speaking, you specify the bonds, it tells you what they should be worth if market rates change. By tweaking the parameters, you can gain an intuition for the decisive factors that contribute to the riskiness of a bond.

*Technical Notes*

Finding the Yield to Maturity, which leads to the calculation of modified duration, a proxy for market risk, requires a solver: this program implements a Newton-Raphson gradient descent method where first derivatives are calculated using a simple implementation of automatic differentiation.

## Instructions

We assume a bond has three decisive parameters:

* Coupon Rate
* Market Price
* Term to Maturity

The [graph](https://cbrookhouse8.github.io/Bonds_Auto_Differentiation/) displays each bond as a point enclosed by a coloured arc. The radius of a point's corresponding arc represents the price of the bond in the market (you specify this as part of the exercise). The horizontal position of the point corresponds to the remaining years until maturity. The vertical axis corresponds to the coupon rate of the bond (the proportion paid of the par value each year).

Each bond can be manipulated by dragging the arc (to change the price) or the grey point (to change the coupon rate or term to maturity):

<img src="./drag_behaviours.png" alt="ellipsoid" width="300px"/>

Below the bonds there is a horizontal bar chart. Each bar represents the sensitivity of the price of the bond of corresponding colour to changes in interest rates. 

The **Modified Duration** refers to the approximate percentage change in price of each bond that could be expected for a 1% change in interest rates.

Crucially, bond prices move inversely to market interest rates. So an increase in market interest rates can be expected to result in a decrease in bond prices. 

## Motivation

* To use visualisation to communicate useful technical ideas to a lay audience
* To implement a solver using Newton-Raphson Gradient Descent and Automatic Differentiation
* To become more familiar with the D3 visualisation library and its data-binding paradigm

## Reflections

* The Horizontal axis is really discrete. However, this user interface fails to convey this adequately. The program can only work with whole number values for the term to maturity.
* The UI is built using d3.js. And the code possibly reveals where d3's data binding paradigm is not so well suited to UI design as it is to data visualisation.
* d4's approach may be a suitable alternative <https://d4.js.org/>
* It would be useful to show Convexity- an indication of the validity of the modified duration linear model
* Perhaps a bond could be represented as a point in 3D space with its hue corresponding to its modified duration.

## References

This adapts <https://github.com/ehaas/js-autodiff>

Jamey Sharp introduced me to Automatic differentiation and helped with the adaptation of the AD object from ehaas.

<https://github.com/jameysharp>
