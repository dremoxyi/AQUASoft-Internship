// 1.1. ES6 Methods //

// ES6 Methods or ECMAScript 6 methods are "functions" that enhance functionnalities and help developers to make cleaner and more efficient code.
// It borrows all methods from it's previous version and add new ones.
// ES6 adds a lot of new things such as:
// Destructuring object and arrays, SpreadOperator, Promises, 'let' and 'const' keywords, Arrow Functions (Used a lot for callbacks now), New Math methods (Math.trunc(x), Math.log2(x) etc...)
// To avoid redundancies, no concrete code examples will be shown here, as most of them have their own chapters.

// 1.2. Difference between var, let, and const. //

// Var -> Function-scoped, Let/Const -> Block-scoped '{}'
// Var, Let can be re-assigned, Const cannot
// Var can be re-declared (Overrides previous declarations), Let and Const cannot
function VarLetConst():void {
    console.log("\n-- VarLetConst --");
    try {
        console.log("> Defining 'var x','let y' and 'const z'")
        var x:number = 1;
        let y:number = 2;
        const z:number = 3;
        console.log("x =",x,"| y =",y,"| z =",z);
        
        console.log("> Let's try re-declaring them")
        var x:number = 4;
        //let y: number = 5; // Error: Cannot redeclare a 'let' variable in the same scope 'y'.
        //const z: number = 6; // Error: Cannot redeclare a 'const' variable in the same scope 'z'.
        console.log("x is overwritten to",x,"| let y cannot be redeclared | const z cannot be redeclared");

        console.log("> Let's try re-assigning them")
        x= 7;
        y= 8;
        //z= 9; // Error: Cannot re-assign a "const" variable.
        console.log("x =",x,"| y =",y,"| 'const' z cannot be re-assigned");

    } catch (error) {
        console.error(error);
        console.log("From: VarLetConst()");
    }
}

VarLetConst();

// 1.3. TypeScriptTypes and Interfaces – what they are, when to use them, and examples. //

//Types & Interfaces are complex structures that allow you to define a custom object.
function TypesInterfaces():void {
    console.log("\n-- TypesInterfaces --");
    console.log("Types & Interfaces are complex structures that allow us to define a custom type,\n In other words, they let us define the shape of an object")
    console.log("Only differences between types & interfaces is that you can re-declare interfaces, and it will concatenate both declaration")
    console.log("They avoid redundancies and makes the code cleaner")
    console.log("> Creating PersonType and PersonInterface")
    type PersonType = {
        id: number;
        name: string;
        age: number;
    };

    interface PersonInterface {
        id: number;
        name: string;
    }
    interface PersonInterface {
        age: number;
    }

    const person1: PersonType = { id: 1, name: "Alice", age: 30 };
    const person2: PersonInterface = { id: 2, name: "Bob", age: 25 };

    console.log("PersonType:", person1, "| PersonInterface:", person2);
}

TypesInterfaces();

// 1.4. Spreadoperator //

// SpreadOperator `...` helps with iterables (objects, arrays, strings etc)
// Used to make a Shallow copy of an object, overwrite specific properties etc
function SpreadOperator():void {
    console.log("\n-- SpreadOperator --")
    console.log("SpreadOperator `...` helps with iterables as it let you spread iterables elements")
    console.log("P.S. : SpreadOperator creates shallow copy ")
    type Person = {
        name: string;
        city: string;
    }
    type Car = {
        brand: string;
        model: string;
        color: string;
        owner: Person;
    }
    console.log("> Let's create 3 Cars, first will be used as a baseline, second will be used to demonstrate SpreadOperator Shallow copy's attribute, third will be using SpreadOperator to demonstrate how to declare to edit elements");
    const car1: Car = { brand: "Toyota", model: "Corolla", color: "Red", owner: { name: "Alex", city: "Bucharest" } };
    console.log("Car 1:", JSON.stringify(car1));
    const car2: Car = { ...car1}; // Change also for car1
    car2.owner.city = "Cluj"; // Change also for car1
    console.log("Car 2:", JSON.stringify(car2));
    const car3: Car = { ...car1, color: "Blue", owner: { ...car1.owner, city: "Drobeta" } };
    car3.owner.city = "Paris"; // Will not change, because car3.owner.city was not nested when declared
    console.log("Car 3:",JSON.stringify(car3));
    console.log("> Let's see what happened overall:")
    console.log("Car1:", car1.owner.city);
    console.log("Car2:", car2.owner.city);
    console.log("Car3:", car3.owner.city);
}

SpreadOperator();

// 1.5. Objects //

function Objects():void {
    console.log("\n-- Objects --");
    console.log()
    type Adress = {
        country: string;
        city: string;
    }
    type Person = {
        name: string;
        adress: Adress;
        age: number;
    }
    
    const persona: Person = { name: "Hugo", adress: {country:"Romania" ,city: "Bucharest"}, age:22};

    const { name:newName, adress:{country:newCountry, city:newCity}, age:newAge } = persona;    // Showing ES6 Destructuring object.
    console.log("Showing destructured values :",newName,newCountry,newCity,newAge);

    const persona_copy: Person = structuredClone(persona); // Example of a Deep copy, modifying nested objects won't change original anymore.
    persona_copy.adress.city = "Gutu";

    console.log("1 ...");
    for(const property in persona){
        const value = (persona as any)[property];
        console.log(`${property}: ${typeof value == "object" ? JSON.stringify(value) : value}`); // If Object then transform it to string to print it in a pretty way
    }
    console.log("2 ...");
    (Object.keys(persona_copy) as Array<keyof typeof persona_copy>).forEach(property => {
        const value = (persona_copy as any)[property];
        console.log(`${property}: ${typeof value == "object" ? JSON.stringify(value) : value}`); // If Object then transform it to string to print it in a pretty way
    });

}

Objects();


// 1.6. Arrays //


function ArrayEx():void {
    console.log("\n-- Array --");
    console.log("> Declaring an Array");
    const Arr: number[] = [1,5,6,6,12,3,9];
    console.log("|| Original Array :",Arr,"||")
    console.log("> Destructuring 3 var: 'index0', 'index2' and 'index3 to EndOfArray'")
    const [one, ,six, ...rest] = Arr; // Showing ES6 Destructuring Array
    console.log("Destructured values :",one,six,rest);

    // Accessor -> Don't modify original Array
    console.log("> Accessor - Don't modify original array <");
    console.log("Concated :",Arr.concat([4,8])); // Create a new Array that combines Arr and [4,3] "Arr" with "[4,3]", kind of adding [4,3] at the end of Arr
    console.log("Array_Slice :",Arr.slice(1,4)); // Extract a copy of the Array. Here from start index "1" to before end index "4" -> Expected [5,6,6]
    console.log("Array_joined :",Arr.join("-")); // Create a string that joins all element from Array separated by "-" 

    console.log("Proof that original has not been modified :",Arr)

    // Iteration -> To iterate through the Array
    console.log("> Iteration - How to iterate through arrays <");
    console.log("**ForEach:**")
    Arr.forEach((value,indx) => (console.log(`i=${indx}: ${value}`))); // Iterate through items, returns nothing
    console.log("************")
        // ES6 Methods
    console.log("Array_filtered(odd_number)",Arr.filter((num) => (num % 2 == 1))); // Create a new Array with element that pass a condition (by iterating). Here we only keep odd numbers
    console.log("Array_mapped([n] => [[n,n+1]]) :", JSON.stringify(Arr.map((num) => ([num,num+1])))); // Create new Array by iterating

    // Mutator -> Modify original Array
    console.log("> Mutator - Modify original array <");
    console.log("Pop result :",Arr.pop(), "              | Array -> popped  :", Arr); // Remove and Return last item from Array (here the "9")
    console.log("New Array length :", Arr.push(2), "        | Array -> 2pushed :", Arr); // Add "2" to the Array and RETURN length of the new Array
    console.log("Sorted Array :",Arr.sort((a,b) => b - a)); // Sorts the Array in descending order
}

ArrayEx();

// 1.7. Promises and Callbacks. //

// Callbacks are functions passed as parameters in another functions
// i.e. Array.filter( () => condition ), Array.map( () => tasks )
// They are also used in Promises, .then(res =>)

function PromisesCallbacks():void {
    console.log("\n-- Promises & Callbacks --");
    
    function DoesThePromiseWillBeResolved(): Promise<String> {  // I purely created a Promise simulation for the example, usually this is embedded inside a request.get()
        return new Promise((resolve, reject) => {
            const simulatedRun = (Math.random() < 0.5);
            if (simulatedRun) {
                resolve("Promise resolved");
            } else {
                reject("Promise not resolved");
            };

        });
    }

    console.log("> Promise request sent");
    console.log("It is a custom promise that has 50% chance of Success.");
    console.log("Expected Output -> '#-Nice-# Promise resolved' or '#-Fake Error-# Promise not resolved'");
    DoesThePromiseWillBeResolved()
    .then(res => {
        console.log("\n-- Promises Response--");     //A promise is asynchronous and mess with code execution order. Thus the reminder '-- Promises Response --'
        console.log("#-Nice-#",res);
    })
    .catch(error => {
        console.log("\n-- Promises Response --");
        console.log("#-Fake Error-#",error);
    })
    .finally(() => console.log("Some .finally() text :)")); // Runs either if then is triggered or catch is triggered
}

PromisesCallbacks();

// 1.8. Async / Await //

// Async/Await makes Promises more readable and easier to work with.
// Instead of .then()/.catch()/.finally() with callbacks inside, we have async function -> await fetch
// ^^ This Avoid Nested Callbacks ^^
// This time i'm using fetch API, to show a real example not a simulation
function AsyncAwait():void {
    console.log("\n-- Async & Await --");

    async function FetchBoredAPI():Promise<void> {
        try {
            
            console.log("This is not a simulation");
            console.log("> Fetching Bored API");
            console.log("Expected Output -> 'You are bored ? Api_random_response' ")
            const APIurl = (typeof window !== 'undefined') ? "/bored-api/random" : "https://bored-api.appbrewery.com/random"; // Bypass CORS restrictions only if on a browser
            const responseObject = await fetch(APIurl);
            const responseJSON = await responseObject.json();
            console.log("\n-- Async/Await Response --");
            console.log("You are bored ?\n"+responseJSON.activity);

        } catch (error) {
            console.error("!ERROR! from AsyncAwait",error);
        }
    };
    
    FetchBoredAPI();    

}

AsyncAwait();

// 1.9. Closures //
// Closure let us use variables outside of their usual scopes.
// Used to create private variables, to 'hide' var/functions.
function Closures(){
    console.log("\n-- Closures --")
    console.log("Closures is a behavior that can be resumed to using a variable outside of it's usual scope")
    console.log("For example, we create a variable inside a function and we are able to use it outside of that function")
    console.log("This is used to encapsulate or create private variables");
    function CreateCounter(): () => number{
        let count:number = 0;

        return ():number => {
            return count++;
        };
    }

    function Multiplier(mult:number):Function {
        function f(num:number):number{
            return num * mult;
        }
        return f;
    }

    const counter = CreateCounter();  // Use of variable "count" outside of its scope # Closure
    console.log("Count :",counter()); // count = 0
    console.log("Count :",counter()); // count = 1
    console.log("Count :",counter()); // count = 2

    const x = Multiplier(3);
    console.log("Multiply 5 by 3 :", x(5)) // Use of variable "mult = 3" outside of its scope
}

Closures()

// 1.10. React Hooks: useState and useRef //

import type { ReactElement } from "react";
import { useState, useRef } from 'react';
import { createRoot } from 'react-dom/client';

function GAMBLING():ReactElement {
    const [BGcolor,setBGcolor] = useState("ghostwhite");
    const [play,setPlay] = useState("Play");
    const [cnt_try,setCnt_try] = useState(0);
    const [num,setNum] = useState(-1);
    const winning_number = useRef(Math.trunc(Math.random() * 10)+1);

    function gamble():string {
        const Random = Math.trunc(Math.random() * 10)+1
        setNum(Random);
        setCnt_try(cnt_try + 1);

        if (Random == winning_number.current) {
            setBGcolor("#1EFFBC")
            return "!! YOU WON !!"
        } else {
            setBGcolor("red")
            return "YOU LOSE"
        }
    }
    
    return (
        <>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                <p style={{backgroundColor: BGcolor, width:"10vw", minWidth:"200px", padding:"10px", marginBottom:"0", border:"2px solid black", borderBottom:"0", borderRadius:"5px 5px 0px 0px", textAlign:"center"}}>Number of tries: {cnt_try}</p>
                <div id="Gamblers div" style={{ backgroundColor: BGcolor ,textAlign: "center", width:"33vw", minWidth:"500px", borderRadius:"20px", border:"2px solid black"} }>
                    <h1>Wanna Gamble? Press the button !</h1>
                    <h3>Goal Number: {winning_number.current}</h3>
                    <h5 style={{ backgroundColor: BGcolor }}>{(num == -1) ? "-- Press Play --" : "Your Number: "+num}</h5>
                    <button type="button" onClick={() => setPlay(gamble())} style={{marginBottom:"1vh", width: "10vw", minWidth:"70px", height:"10vh"}}>{play}</button> 
                </div>
            </div>
        </>
    )
}

if (typeof document !== 'undefined') {                      // Avoid Error: "document not defined" if not on a browser
    createRoot(document.getElementById('root')!).render(
        <GAMBLING />
    );
}
