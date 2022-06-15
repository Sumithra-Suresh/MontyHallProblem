
import { MACHINE } from "./stateMachine.js";

// Since JS is included as type module, we need to expose the showTabContent to
// window object. This is because module creates a scope to avoid name collisions.
// Note: showTabContent is an onclick callback defined in index.html 
window.showTabContent = showTabContent; 

// Global variales

const DOOR_ELEM_G = document.querySelectorAll(".door");     
const NUM_OF_DOORS_G = DOOR_ELEM_G.length;   // Set the number of doors

const GAME_STATE_G = Object.create(MACHINE);    // Instantiate game state machine object
let doors_G = [];                               // Array of door objects
let win_G = 0;                                  // Counter for Win and Lose
let lose_G = 0;                                               
let gameMode_G = "play";                        // Game Mode : play or simulate

//=========================================================================================================
// createData
// Door object properties
// 
//=========================================================================================================

function createData(){
    return{
        prize: "🐐",
        selected: false,
        revealed: false,
        reset: function(){
            Object.assign(this, createData());
        }
    }
}

//=========================================================================================================
// Initialization
// Setting up a load handler to do the main startup work once the page is fully loaded.
//
//=========================================================================================================

window.addEventListener("load", startup, false);

function startup() {

    document.querySelector(".simulate__btn").addEventListener("click",runSimulation); 
    
    // reset the progress bar when there is a change in number of simulation run times.
    document.querySelector('#times').addEventListener("change",resetProgressBar);  

    // create doors and add Event listeners
    for(let i=0; i<NUM_OF_DOORS_G; i++)
    {
        doors_G.push(createData());
        DOOR_ELEM_G[i].addEventListener('click',()=>selectDoor(i));
    }

    initWinnigDoor(); // select a random winning door and assign the winning prize
}

//=========================================================================================================
// selectDoor - Door click event listener callback
// Based on the game state the door click will be handled.
// More info @ README.md
//=========================================================================================================
function selectDoor(a_index){
    
    switch (GAME_STATE_G.state){

        case 'USER_SELECTION':
            if( doors_G[a_index].selected === false)
            {
                doors_G[a_index].selected = true;
                if(gameMode_G === 'play') DOOR_ELEM_G[a_index].innerText = "🔒";
                    
                GAME_STATE_G.dispatch('press');   // change the state of the game machine
                hostReveal();
            }
            break;

        case 'HOST_REVEAL':
            if( doors_G[a_index].revealed === false)
            {
                GAME_STATE_G.dispatch('press');
                revealWin(a_index);
            }
            break;

        case 'REVEAL_WIN':
            GAME_STATE_G.dispatch('press');
            restartGame();
            break;

        default:
            console.error("Wrong game state!");
            break;
    }
}

//=========================================================================================================
// hostReveal
// Host should reveal the door which is not selected by the user
// and it should not be the car
//=========================================================================================================

function hostReveal(){

    for(let i=0; i<NUM_OF_DOORS_G; i++){

        if(doors_G[i].selected === false && doors_G[i].prize !== "🚗"){

            // Reveal the prize only for play mode
            if(gameMode_G === 'play') DOOR_ELEM_G[i].innerText = doors_G[i].prize;
        
            doors_G[i].selected = true;
            doors_G[i].revealed = true;

            displayMsg("Do you want to keep your choice or change it?");
            break;
        }
    }
}

//=========================================================================================================
// revealWin
// Reveal win or lose
// 
//=========================================================================================================

function revealWin(a_doorIndex){

    if(doors_G[a_doorIndex].prize==="🚗"){
        win_G++;
        displayMsg("You WIN! Tap any door to play again");         
    }
    else{
        lose_G++;
        displayMsg("Nice Try! Tap any door to play again");
    }
    // reveal all doors
    if(gameMode_G === 'play'){
        for(let i=0; i<NUM_OF_DOORS_G; i++){
            DOOR_ELEM_G[i].innerText = doors_G[i].prize;
        }
    }

}

//=========================================================================================================
// restartGame
// Reset the door properties, DOM element and global varaibles
// 
//=========================================================================================================
function restartGame(){
    
    for(let i=0; i<NUM_OF_DOORS_G; i++)
    {
      doors_G[i].reset();
      DOOR_ELEM_G[i].innerText = "";
    }

    displayMsg("Pick one of the three doors");
    GAME_STATE_G.state = 'USER_SELECTION';
    initWinnigDoor();
}

//=========================================================================================================
// Helper Functions
//
// randomIndexGenerator()   - Random number generator for door selection 
// initWinnigDoor()         - Select a random winning door and assign the winning prize
// displayMsg(msg)          - Display the game message 
//
//=========================================================================================================

const randomIndexGenerator = () => Math.floor(Math.random() * NUM_OF_DOORS_G);
const initWinnigDoor = () => doors_G[randomIndexGenerator()].prize = "🚗";
const displayMsg = (msg) => document.querySelector("#play-info").innerText = msg;


//=========================================================================================================
// showTabContent
// Switch between 'Play' and 'Simulate' tabs
//
//=========================================================================================================

function showTabContent(event, a_selectedTab){

    const tabContents = document.querySelectorAll('.tab-content__data');

    tabContents.forEach((tabContent)=>{
        tabContent.classList.remove('tab-content__active');
    });

    // get the selectedTab and set it to active
    document.querySelector(`#${a_selectedTab}`).classList.add('tab-content__active');

    // For 'simulate' mode disable the door clicks
    if(a_selectedTab === 'tab-content__simulate'){  
        document.querySelector(".door-wrapper").style.pointerEvents = 'none';
        gameMode_G = "simulate";
        
    }
    else{
        document.querySelector(".door-wrapper").style.pointerEvents = 'auto';
        gameMode_G = "play";
    }
    
    // restart the game and reset the progress bar for new simulation
    restartGame();
    resetProgressBar()
}

//=========================================================================================================
// Simulation
// Get the number of times to run and chocie selection(switch/keep) from the form and run simulation.
//
//=========================================================================================================

function runSimulation(e){

    e.preventDefault(); // stop the default form submission

    const form = document.querySelector("#simulation-form");
           
    const formData = new FormData(form);
    const simulTimes = formData.get('times');
    const choiceSelection = formData.get('choice');

    // Reset the win and lose variable before every new simulation
    win_G = 0;
    lose_G = 0;

    // run simulation
    // 1. User choose a random door
    // 2. Host reveal
    // 3(a). User choose the same door as step #1 (Keep)
    // 3(b). User switch door (Change)
    // 4. Reveal win/lose 

    for(let i=0; i<simulTimes; i++){

        restartGame(); 

        // Select the door index and keep the choice for second round.
        const userDoorIndex = randomIndexGenerator();
        selectDoor(userDoorIndex);

        switch(choiceSelection){
            case 'keep':
                // User choose the same door as step #1
                selectDoor(userDoorIndex);
                break;
            case 'change':
                // find the door to switch
                for(let i=0;i<NUM_OF_DOORS_G;i++){
                    if(doors_G[i].selected === false){
                        selectDoor(i);
                        break;
                    }
                }
                break;
            default:
                break;
        }
        
    }
    
    updateProgressBar(choiceSelection, simulTimes);
    
    //console.log(`Win : ${win_G} & Lose : ${lose_G}`); // Test

}

//=========================================================================================================
// Update progress bar
// Update the progress bar with win% and lose%
//
//=========================================================================================================

function updateProgressBar(a_choiceSelection, a_simulTimes) {

    let winPercent = Math.round((win_G/a_simulTimes)*100);
    let losePercent = Math.round((lose_G/a_simulTimes)*100);

    if(a_choiceSelection === 'keep'){
        document.querySelector(".progress-keep").style.width = `${winPercent}%`;
        document.querySelector("#keep-win").textContent= `${winPercent}%`; 
        document.querySelector("#keep-lose").textContent= `${losePercent}%`; 
    }
    else{
        document.querySelector(".progress-change").style.width = `${winPercent}%`;
        document.querySelector("#change-win").textContent= `${winPercent}%`; 
        document.querySelector("#change-lose").textContent= `${losePercent}%`; 
    }
    
}

//=========================================================================================================
// Reset progress bar
// Reset the progress bar when the user changes the simulation run times. 
//
//=========================================================================================================

function resetProgressBar() {
    // Keep choice
    document.querySelector(".progress-keep").style.width = '0%';
    document.querySelector("#keep-win").textContent= '0%'; 
    document.querySelector("#keep-lose").textContent= '0%'; 

    // Change choice
    document.querySelector(".progress-change").style.width = '0%';
    document.querySelector("#change-win").textContent= '0%'; 
    document.querySelector("#change-lose").textContent= '0%'; 
}
  
