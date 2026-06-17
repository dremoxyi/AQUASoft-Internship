import { jsxs as _jsxs, jsx as _jsx, Fragment as _Fragment } from "react/jsx-runtime";
function VarLetConst() {
    console.log("-- VarLetConst --");
    try {
        var x = 1;
        let y = 2;
        const z = 3;
        console.log("x =", x, "y =", y, "z =", z);
        var x = 4;
        console.log("x =", x, "y =", y, "z =", z);
        x = 7;
        y = 8;
        console.log("x =", x, "y =", y, "z =", z);
    }
    catch (error) {
        console.error(error);
        console.log("From: VarLetConst()");
    }
}
VarLetConst();
function TypesInterfaces() {
    console.log("-- TypesInterfaces --");
    const person1 = { id: 1, name: "Alice", age: 30 };
    const person2 = { id: 2, name: "Bob", age: 25 };
    console.log("Type:", person1, "Interface:", person2);
}
TypesInterfaces();
function SpreadOperator() {
    const car1 = { brand: "Toyota", model: "Corolla", color: "Red", owner: { name: "Alex", city: "Bucharest" } };
    const car2 = { ...car1 };
    car2.owner.city = "Cluj";
    const car3 = { ...car1, color: "Blue", owner: { ...car1.owner, city: "Drobeta" } };
    console.log("Car1:", car1.owner.city);
    console.log("Car2:", car2.owner.city);
    console.log("Car3:", car3.owner.city);
}
SpreadOperator();
function Objects() {
    console.log("-- Objects --");
    const persona = { name: "Hugo", adress: { country: "Romania", city: "Bucharest" }, age: 22 };
    const persona_copy = structuredClone(persona);
    persona_copy.adress.city = "Gutu";
    console.log("1.");
    for (const property in persona) {
        const value = persona[property];
        console.log(`${property}: ${typeof value == "object" ? JSON.stringify(value) : value}`);
    }
    console.log("2.");
    Object.keys(persona_copy).forEach(property => {
        const value = persona_copy[property];
        console.log(`${property}: ${typeof value == "object" ? JSON.stringify(value) : value}`);
    });
}
Objects();
function ArrayEx() {
    console.log("-- Array --");
    const Arr = [1, 5, 6, 6, 12, 3, 9];
    console.log("> Accessor <");
    console.log("Concated :", Arr.concat([4, 8]));
    console.log("Array_Slice :", Arr.slice(1, 4));
    console.log("Array_joined :", Arr.join("-"));
    console.log("Proof that original is untouched :", Arr);
    console.log("> Iteration <");
    Arr.forEach((value, indx) => (console.log(`i=${indx}: ${value}`)));
    console.log("Array_filtered", Arr.filter((num) => (num % 2 == 1)));
    console.log("Array_mapped :", JSON.stringify(Arr.map((num) => ([num, num + 1]))));
    console.log("> Mutator <");
    console.log("Pop result :", Arr.pop(), "| Array -> popped :", Arr);
    console.log("New Array length :", Arr.push(2), "Array -> 2pushed :", Arr);
    console.log("Sorted Array :", Arr.sort((a, b) => b - a));
}
ArrayEx();
function PromisesCallbacks() {
    console.log("-- Promises & Callbacks --");
    function DoesThePromiseWillBeResolved() {
        return new Promise((resolve, reject) => {
            const simulatedRun = (Math.random() < 0.5);
            if (simulatedRun) {
                resolve("Promise resolved");
            }
            else {
                reject("Promise not resolved");
            }
            ;
        });
    }
    console.log("> Promise request sent <");
    console.log("It is a custom promise that has 50% chance of Success.");
    console.log("Expected output -> '#-Nice-# Promise resolved' or '#-Fake Error-# Promise not resolved'");
    DoesThePromiseWillBeResolved()
        .then(res => {
        console.log("-- Promises Response--");
        console.log("#-Nice-#", res);
    })
        .catch(error => {
        console.log("-- Promises Response --");
        console.log("#-Fake Error-#", error);
    })
        .finally(() => console.log("Some .finally() text :)"));
}
PromisesCallbacks();
function AsyncAwait() {
    console.log("-- Async & Await --");
    async function getBleachChar() {
        try {
            console.log("> Fetching Bored API <");
            console.log("No luck involved this ain't a simulation");
            const responseObject = await fetch("https://bored-api.appbrewery.com/random");
            const responseJSON = await responseObject.json();
            console.log("-- Async/Await Response --");
            console.log("You are bored ?\n" + responseJSON.activity);
        }
        catch (error) {
            console.error("!ERROR! from AsyncAwait", error);
        }
    }
    ;
    getBleachChar();
}
AsyncAwait();
function Closures() {
    console.log("-- Closures --");
    function CreateCounter() {
        let count = 0;
        return () => {
            return count++;
        };
    }
    function Multiplier(mult) {
        function f(num) {
            return num * mult;
        }
        return f;
    }
    const counter = CreateCounter();
    console.log("Count :", counter());
    console.log("Count :", counter());
    console.log("Count :", counter());
    const x = Multiplier(3);
    console.log("Multiply 5 by 3 :", x(5));
}
Closures();
import { useState, useRef } from 'react';
import { createRoot } from 'react-dom/client';
function GAMBLING() {
    console.log("-- React Hooks --");
    const [BGcolor, setBGcolor] = useState("white");
    const [play, setPlay] = useState("Play");
    const winning_number = Math.trunc(Math.random() * 10) + 1;
    const cnt_try = useRef(0);
    function gamble() {
        const num = Math.trunc(Math.random() * 10) + 1;
        cnt_try.current += 1;
        if (num == winning_number) {
            setBGcolor("lightgreen");
            return "!! YOU WON !!";
        }
        else {
            setBGcolor("lightred");
            return "YOU LOSE";
        }
    }
    return (_jsxs(_Fragment, { children: [_jsxs("p", { children: ["Number of tries: ", cnt_try.current] }), _jsxs("div", { color: BGcolor, children: [_jsx("h1", { children: "Wanna Gamble? Press the button !" }), _jsx("button", { type: "button", onClick: () => setPlay(gamble()), children: play })] })] }));
}
createRoot(document.getElementById('root')).render(_jsx(GAMBLING, {}));
//# sourceMappingURL=HomeWork1.js.map