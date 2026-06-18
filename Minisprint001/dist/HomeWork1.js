import { jsxs as _jsxs, jsx as _jsx, Fragment as _Fragment } from "react/jsx-runtime";
function VarLetConst() {
    console.log("\n-- VarLetConst --");
    try {
        console.log("> Defining 'var x','let y' and 'const z'");
        var x = 1;
        let y = 2;
        const z = 3;
        console.log("x =", x, "| y =", y, "| z =", z);
        console.log("> Let's try re-declaring them");
        var x = 4;
        console.log("x is overwritten to", x, "| let y cannot be redeclared | const z cannot be redeclared");
        console.log("> Let's try re-assigning them");
        x = 7;
        y = 8;
        console.log("x =", x, "| y =", y, "| 'const' z cannot be re-assigned");
    }
    catch (error) {
        console.error(error);
        console.log("From: VarLetConst()");
    }
}
VarLetConst();
function TypesInterfaces() {
    console.log("\n-- TypesInterfaces --");
    console.log("Types & Interfaces are complex structures that allow us to define a custom type,\n In other words, they let us define the shape of an object");
    console.log("Only differences between types & interfaces is that you can re-declare interfaces, and it will concatenate both declaration");
    console.log("They avoid redundancies and makes the code cleaner");
    console.log("> Creating PersonType and PersonInterface");
    const person1 = { id: 1, name: "Alice", age: 30 };
    const person2 = { id: 2, name: "Bob", age: 25 };
    console.log("PersonType:", person1, "| PersonInterface:", person2);
}
TypesInterfaces();
function SpreadOperator() {
    console.log("\n-- SpreadOperator --");
    console.log("SpreadOperator `...` helps with iterables as it let you spread iterables elements");
    console.log("P.S. : SpreadOperator creates shallow copy ");
    console.log("> Let's create 3 Cars, first will be used as a baseline, second will be used to demonstrate SpreadOperator Shallow copy's attribute, third will be using SpreadOperator to demonstrate how to declare to edit elements");
    const car1 = { brand: "Toyota", model: "Corolla", color: "Red", owner: { name: "Alex", city: "Bucharest" } };
    console.log("Car 1:", JSON.stringify(car1));
    const car2 = { ...car1 };
    car2.owner.city = "Cluj";
    console.log("Car 2:", JSON.stringify(car2));
    const car3 = { ...car1, color: "Blue", owner: { ...car1.owner, city: "Drobeta" } };
    car3.owner.city = "Paris";
    console.log("Car 3:", JSON.stringify(car3));
    console.log("> Let's see what happened overall:");
    console.log("Car1:", car1.owner.city);
    console.log("Car2:", car2.owner.city);
    console.log("Car3:", car3.owner.city);
}
SpreadOperator();
function Objects() {
    console.log("\n-- Objects --");
    console.log();
    const persona = { name: "Hugo", adress: { country: "Romania", city: "Bucharest" }, age: 22 };
    const { name: newName, adress: { country: newCountry, city: newCity }, age: newAge } = persona;
    console.log("Showing destructured values :", newName, newCountry, newCity, newAge);
    const persona_copy = structuredClone(persona);
    persona_copy.adress.city = "Gutu";
    console.log("1 ...");
    for (const property in persona) {
        const value = persona[property];
        console.log(`${property}: ${typeof value == "object" ? JSON.stringify(value) : value}`);
    }
    console.log("2 ...");
    Object.keys(persona_copy).forEach(property => {
        const value = persona_copy[property];
        console.log(`${property}: ${typeof value == "object" ? JSON.stringify(value) : value}`);
    });
}
Objects();
function ArrayEx() {
    console.log("\n-- Array --");
    console.log("> Declaring an Array");
    const Arr = [1, 5, 6, 6, 12, 3, 9];
    console.log("|| Original Array :", Arr, "||");
    console.log("> Destructuring 3 var: 'index0', 'index2' and 'index3 to EndOfArray'");
    const [one, , six, ...rest] = Arr;
    console.log("Destructured values :", one, six, rest);
    console.log("> Accessor - Don't modify original array <");
    console.log("Concated :", Arr.concat([4, 8]));
    console.log("Array_Slice :", Arr.slice(1, 4));
    console.log("Array_joined :", Arr.join("-"));
    console.log("Proof that original has not been modified :", Arr);
    console.log("> Iteration - How to iterate through arrays <");
    console.log("**ForEach:**");
    Arr.forEach((value, indx) => (console.log(`i=${indx}: ${value}`)));
    console.log("************");
    console.log("Array_filtered(odd_number)", Arr.filter((num) => (num % 2 == 1)));
    console.log("Array_mapped([n] => [[n,n+1]]) :", JSON.stringify(Arr.map((num) => ([num, num + 1]))));
    console.log("> Mutator - Modify original array <");
    console.log("Pop result :", Arr.pop(), "              | Array -> popped  :", Arr);
    console.log("New Array length :", Arr.push(2), "        | Array -> 2pushed :", Arr);
    console.log("Sorted Array :", Arr.sort((a, b) => b - a));
}
ArrayEx();
function PromisesCallbacks() {
    console.log("\n-- Promises & Callbacks --");
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
    console.log("> Promise request sent");
    console.log("It is a custom promise that has 50% chance of Success.");
    console.log("Expected Output -> '#-Nice-# Promise resolved' or '#-Fake Error-# Promise not resolved'");
    DoesThePromiseWillBeResolved()
        .then(res => {
        console.log("\n-- Promises Response--");
        console.log("#-Nice-#", res);
    })
        .catch(error => {
        console.log("\n-- Promises Response --");
        console.log("#-Fake Error-#", error);
    })
        .finally(() => console.log("Some .finally() text :)"));
}
PromisesCallbacks();
function AsyncAwait() {
    console.log("\n-- Async & Await --");
    async function FetchBoredAPI() {
        try {
            console.log("This is not a simulation");
            console.log("> Fetching Bored API");
            console.log("Expected Output -> 'You are bored ? Api_random_response' ");
            const APIurl = (typeof window !== 'undefined') ? "/bored-api/random" : "https://bored-api.appbrewery.com/random";
            const responseObject = await fetch(APIurl);
            const responseJSON = await responseObject.json();
            console.log("\n-- Async/Await Response --");
            console.log("You are bored ?\n" + responseJSON.activity);
        }
        catch (error) {
            console.error("!ERROR! from AsyncAwait", error);
        }
    }
    ;
    FetchBoredAPI();
}
AsyncAwait();
function Closures() {
    console.log("\n-- Closures --");
    console.log("Closures is a behavior that can be resumed to using a variable outside of it's usual scope");
    console.log("For example, we create a variable inside a function and we are able to use it outside of that function");
    console.log("This is used to encapsulate or create private variables");
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
    const [BGcolor, setBGcolor] = useState("ghostwhite");
    const [play, setPlay] = useState("Play");
    const [cnt_try, setCnt_try] = useState(0);
    const [num, setNum] = useState(-1);
    const winning_number = useRef(Math.trunc(Math.random() * 10) + 1);
    function gamble() {
        const Random = Math.trunc(Math.random() * 10) + 1;
        setNum(Random);
        setCnt_try(cnt_try + 1);
        if (Random == winning_number.current) {
            setBGcolor("#1EFFBC");
            return "!! YOU WON !!";
        }
        else {
            setBGcolor("red");
            return "YOU LOSE";
        }
    }
    return (_jsx(_Fragment, { children: _jsxs("div", { style: { display: "flex", flexDirection: "column", alignItems: "center" }, children: [_jsxs("p", { style: { backgroundColor: BGcolor, width: "10vw", minWidth: "200px", padding: "10px", marginBottom: "0", border: "2px solid black", borderBottom: "0", borderRadius: "5px 5px 0px 0px", textAlign: "center" }, children: ["Number of tries: ", cnt_try] }), _jsxs("div", { id: "Gamblers div", style: { backgroundColor: BGcolor, textAlign: "center", width: "33vw", minWidth: "500px", borderRadius: "20px", border: "2px solid black" }, children: [_jsx("h1", { children: "Wanna Gamble? Press the button !" }), _jsxs("h3", { children: ["Goal Number: ", winning_number.current] }), _jsx("h5", { style: { backgroundColor: BGcolor }, children: (num == -1) ? "-- Press Play --" : "Your Number: " + num }), _jsx("button", { type: "button", onClick: () => setPlay(gamble()), style: { marginBottom: "1vh", width: "10vw", minWidth: "70px", height: "10vh" }, children: play })] })] }) }));
}
if (typeof document !== 'undefined') {
    createRoot(document.getElementById('root')).render(_jsx(GAMBLING, {}));
}
//# sourceMappingURL=HomeWork1.js.map