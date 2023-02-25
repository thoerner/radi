import { useState, useEffect } from 'react';
import './App.css';
import Typewriter from 'typewriter-effect';
import parse from 'html-react-parser';
import { useSearchParams } from 'react-router-dom';
import toast, { Toaster } from 'react-hot-toast';

function App() {
  const [searchParams] = useSearchParams();
  const [prompts, setPrompts] = useState([]);
  const [responses, setResponses] = useState([]);
  const [name, setName] = useState('User');
  const [convo, setConvo] = useState('');
  const [convoActive, setConvoActive] = useState(false);
  const [promptInput, setPromptInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [gold, setGold] = useState(100);
  const [health, setHealth] = useState(100);
  const [energy, setEnergy] = useState(100);
  const [inventory, setInventory] = useState([]);
  const [aiUpdated, setAiUpdated] = useState(false);
  const [buttons, setButtons] = useState(<div></div>);
  const [ai, setAi] = useState(0);

  const aiList = [
    {
      name: 'Radi the Wizard',
      intro: 'Introduce yourself.',
      index: 0},
    {
      name: 'Sara the Pirate',
      intro: 'Introduce yourself.',
      index: 1},
    {
      name: 'Jeff the Programmer',
      intro: 'Write a humorous "hello world" code to introduce yourself.',
      index: 2},
    {
      name: 'Sally the 5th Grade Teacher',
      intro: 'Introduce yourself and give the class a word problem or other activity to warm up.',
      index: 3},
    {
      name: 'Bob the Builder',
      intro: 'Introduce yourself.',
      index: 4},
    {
      name: 'Chompy the Hippo',
      intro: 'Introduce yourself.',
      index: 5},
    {
      name: 'Dungeon Master',
      intro: '',
      index: 6},
    {
      name: 'Ned the Nerd',
      intro: 'Introduce yourself.',
      index: 7
    },
    {
      name: 'The Oracle',
      intro: 'Introduce yourself.',
      index: 8
    }   
  ];

  // useEffect(() => {
  //   if (searchParams.get('ai')) {
  //     const aiIndex = parseInt(searchParams.get('ai'));
  //     setAi(aiIndex);
  //   }
  // }, [searchParams]);

  useEffect(() => {
    handleClear();
  }, [ai])

  // get response from api
  const getResponse = async (name, convo, prompt, aiIndex) => {
    if (searchParams.get('ai') && !aiUpdated) {
      aiIndex = parseInt(searchParams.get('ai'));
      setAi(aiIndex);
      setAiUpdated(true);
      return;
    }
    const response = await fetch('https://radi-api.crypt0potam.us/api', {
      method: 'POST',
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: name,
        convo: convo,
        prompt: prompt,
        aiIndex: aiIndex,
      }),
    });
    const body = await response.json();
    if (response.status !== 200) throw Error(body.message);

    body.response = body.response.replace(/&lt;/g, '<');
    body.response = body.response.replace(/&gt;/g, '>');
    body.response = body.response.replace(/&quot;/g, '"');
    body.response = body.response.replace(/&#39;/g, '\'');
    // body.response = body.response.replace(/""/g, '"');
    const endSymbol = body.response.indexOf('#');
    body.response = body.response.slice(0, endSymbol).trim();
    if (ai === 6) {
      const keyStart = body.response.indexOf('[{');
      const keyEnd = body.response.indexOf('}]') + 2;
      const keyList = body.response.slice(keyStart, keyEnd);
      body.response = body.response.replace(keyList, '');
      setButtons(await createButtonsJSX(keyList));
    }

    return body;
  };

  const createButtonsJSX = async (keys) => {
    const keyArray = await JSON.parse(keys);
    console.log(keyArray[0].choice)
    const buttonsJSX = keyArray.map((k) => {
      return (
        <button
          key={k.choiceId}
          className="choiceButton"
          onClick={() => {
            window.handleChoiceClick(k.choiceId, k.gold, k.health, k.cost, k.item, k.energy);
          }}
        >{k.buttonText}{k.cost ? ` (${k.cost} gold)` : ''}
        </button>
      );
    });
    return buttonsJSX;
  }

  const scrollToBottom = () => {
    window.scrollTo(0, document.body.scrollHeight);
  }

  const getConvo = async (seed) => {
    if (convoActive) return;
    setConvoActive(true);
    seed = seed || '';
    setLoading(true);
    const intro = aiList[ai].intro;
    const response = await getResponse(name, seed, intro, ai);
    response ? setConvo(response.convo) : setConvo('');
    setLoading(false);
    setResponses([...responses, response.response]);
    setPrompts([...prompts, intro])
  }

  useEffect(() => { 
    if (!convoActive) {
      setLoading(true);
      let seed = Math.floor(Math.random() * 1000000000);
      getConvo(seed);
    } else {
    }
  }, [convoActive]);

  useEffect(() => {
    scrollToBottom();
  }, [prompts]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const prompt = promptInput;
    setPromptInput('');
    setPrompts([...prompts, prompt]);
    setLoading(true);
    const response = await getResponse(name, convo, prompt, ai);
    setResponses([...responses, response.response]);
    setConvo(response.convo);
    setLoading(false);
    setTimeout(() => {
      scrollToBottom();
    }, 100);
  };

  useEffect(() => {
    console.log(convo)
  }, [convo])

  const handleNameChange = (e) => {
    setName(e.target.value);
  };

  const handleClear = () => {
    setPrompts([]);
    setResponses([]);
    setConvo('');
    setPromptInput('');
    setGold(100);
    setHealth(100);
    setEnergy(100);
    setInventory([]);
    setButtons(<div></div>);
    setConvoActive(false);
  };

  const LoadingAni = () => {
    return (
      <div style={styles.loadingAnimation}>
        <div className="lds-grid"><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div></div>
      </div>
    )
  }

  const handleAiChange = (e) => {
    setAiUpdated(true);
    setAi(e.target.value);
  }

  window.handleChoiceClick = (choice, goldUpdate, healthUpdate, cost, item, energyUpdate) => {
    var totalGold = -cost || 0;
    if (cost) {
      if (gold < cost) return toast('Not enough gold!');
      toast.error(`-${cost} gold`)
    }
    setPromptInput(choice);
    handleChoice(choice);
    if (healthUpdate) {
      if (healthUpdate > 0) {
        toast.success(`+${healthUpdate} health`)
      } else {
        toast.error(`${healthUpdate} health`)
      }
      setHealth(health + healthUpdate);
    }
    if (goldUpdate) {
      if (goldUpdate > 0) {
        toast.success(`+${goldUpdate} gold`)
      } else {
        toast.error(`${goldUpdate} gold`)
      }
      totalGold += goldUpdate;
    }
    setGold(gold + totalGold);
    if (item) {
      setInventory([...inventory, item]);
      toast.success(`You got a ${item}!`);
    }
    if (energyUpdate) {
      if (energyUpdate > 0) {
        toast.success(`+${energyUpdate} energy`)
      } else {
        toast.error(`${energyUpdate} energy`)
      }
      setEnergy(energy + energyUpdate);
    }
  }

  useEffect(() => {
    if (health <= 0) {
      toast('You died!');
      handleClear();
    }
  }, [health]);

  const StatusBar = props => {
    return (
      <div style={styles.statusBar}>
        <GoldBalance />
        <HealthBar />
        <EnergyBar />
      </div>
    )
  }

  const GoldBalance = props => {
    return (
      <div style={styles.goldBalance}>
        <h3>Gold: {gold}</h3>
      </div>
    )
  }

  const HealthBar = props => {
    return (
      <div style={styles.healthBar}>
        <h3>Health: {health}</h3>
      </div>
    )
  }

  const EnergyBar = props => {
    return (
      <div style={styles.energyBar}>
        <h3>Energy: {energy}</h3>
      </div>
    )
  }

  const Inventory = props => {
    return (
      <div style={styles.inventory}>
        <h3>Inventory:</h3>
        <ul>
          {inventory.map((i) => {
            return (
              <li key={i}>{i}</li>
            )
          })}
        </ul>
      </div>
    )
  }

  const Buttons = props => {
    return (
      <div style={styles.buttons}>
        {buttons}
      </div>
    )
  }

  const handleChoice = async (choice) => {
    const prompt = choice;
    setPromptInput('');
    setPrompts([...prompts, prompt]);
    setLoading(true);
    const response = await getResponse(name, convo, prompt, ai);
    setResponses([...responses, response.response]);
    setConvo(response.convo);
    setLoading(false);
    setTimeout(() => {
      scrollToBottom();
    }, 100);
  };


  return (
    <div className="App">
      <Toaster 
        position="bottom-center"
        reverseOrder={false}
        toastOptions={{
          style: {
            fontSize: '3rem',
            backgroundColor: '#333',
            color: '#fff',
          },
        }}
      />
      <header className="App-header">
        <div style={{height: '8rem', position: 'fixed', top:0, left:0, width: '100vw', backgroundColor: "gray"}}>
          <h1>{aiList[ai].name}</h1>
          <select value={ai} onChange={(e) => handleAiChange(e)}>
            {aiList.map((ai, index) => (
              <option key={index} value={index}>{ai.name}</option>
            ))}
          </select>
        </div>
        <div style={styles.mainContainer}>
          {aiList[ai].name === 'Dungeon Master' ? <StatusBar/> : null}

        <form onSubmit={handleSubmit}>
          <div style={styles.nameInputContainer}>
            <label>
              Name:{" "}
              <input type="text" value={name} onChange={handleNameChange}/>
            </label>
          </div>
          <div style={styles.promptContainer}>
            {loading ? <LoadingAni /> : null}
            {buttons !== <div></div> && !loading ? <div style={{textAlign: 'center', width: '100vw'}}><Buttons /></div>: null}
            {ai !== 6 &&
            <>
                <label>
                  <input id="promptInput" style={styles.promptInput} type="text" value={promptInput} onChange={(e) => setPromptInput(e.target.value)} />
                </label>
                <input id="submitButton" style={styles.promptSubmit} type="submit" value="Submit" />
            </>
            }
          </div>
          <div style={styles.clearButton} onClick={() => handleClear()}>Clear</div>
        </form>
        <div>
          {prompts.length === 0 && loading  && <LoadingAni />}
          {prompts.map((prompt, index) => (
            <div key={index}>
              {index !== 0 &&
                <p style={styles.userPrompt}>{prompt}</p>}
              <div>
                <Typewriter
                  options={{
                    strings: [index < responses.length ? responses[index] : ''],
                    autoStart: true,
                    delay: 20,
                    loop: false,
                    deleteSpeed: Infinity,
                    cursor: ''
                  }}
                />
                {/* <Typed
                  strings={[index < responses.length ? responses[index] : '']}
                  typeSpeed={40}
                  showCursor={false}
                /> */}
              </div>
            </div>
          ))}
        </div>
        </div>
      </header>
      <div style={{height: '4rem'}}></div>
    </div>
  );
}

// prompt should be fixed to bottom of screen
const styles = {
  mainContainer: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'flex-start',
    margin: '10rem 2rem 4rem 2rem',
    backgroundColor: '#111',
    padding: '1rem',
    borderRadius: '1rem',
    width: 'calc(100vw - 12rem)',
    minHeight: 'calc(50vh - 14rem)',

  },
  promptContainer: {
    position: 'fixed',
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    bottom: 0,
    left: 0,
    width: 'calc(100vw - 100px)',
    minHeight: '6rem',
    backgroundColor: 'black',
    paddingLeft: '100px',
  },
  promptInput: {
    width: 'calc(100vw - 300px)',
    height: '4rem',
    border: 'none',
    fontSize: '1.5rem',
    backgroundColor: 'white',
    color: 'black',
    lineHeight: '1.5rem',
    margin: '1rem'
  },
  promptSubmit: {
    width: '100px',
    height: '4rem',
    border: 'none',
    fontSize: '1.5rem',
    backgroundColor: 'white',
    color: 'black',
    lineHeight: '1.5rem',
    margin: '1rem',
    cursor: 'pointer'
  },
  nameInputContainer: {
    position: 'fixed',
    top: 0,
    left: 0,
    margin: '1rem',
    backgroundColor: 'black',
    padding: '1rem',
    borderRadius: '1rem',
    color: 'white'
  },
  loadingAnimation: {
    position: 'fixed',
    bottom: 0,
    left: 0,
    marginLeft: '0.75rem'
  },
  clearButton: {
    position: 'fixed',
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    top: 0,
    right: 0,
    border: 'none',
    fontSize: '1.5rem',
    backgroundColor: 'white',
    color: 'black',
    lineHeight: '1.5rem',
    margin: '1rem',
    height: '4rem',
    width: '100px',
    cursor: 'pointer',
  },
  userPrompt: {
    color: 'yellow',
    fontSize: '1.5rem',
    margin: '1rem'
  },
  statusbar: {
    position: 'fixed',
    top: '1rem',
    right: '1rem',
    margin: '8rem 1rem 0 0',
    backgroundColor: 'black',
    padding: '1rem',
    borderRadius: '1rem',
    color: 'white',
    border: '1px solid white',
    opacity: 0.9
  },
  goldBalance: {
    position: 'fixed',
    top: '1rem',
    right: '1rem',
    margin: '8rem 1rem 0 0',
    backgroundColor: 'gold',
    padding: '1rem',
    borderRadius: '1rem',
    color: 'black',
    border: '1px solid black',
    opacity: 0.9
  },
  healthBar: {
    position: 'fixed',
    top: '1rem',
    right: '15rem',
    margin: '8rem 1rem 0 0',
    backgroundColor: 'red',
    padding: '1rem',
    borderRadius: '1rem',
    color: 'black',
    border: '1px solid black',
    opacity: 0.9
  },
  energyBar: {
    position: 'fixed',
    top: '1rem',
    right: '31rem',
    margin: '8rem 1rem 0 0',
    backgroundColor: 'blue',
    padding: '1rem',
    borderRadius: '1rem',
    color: 'black',
    border: '1px solid black',
    opacity: 0.9
  },
  inventory: {
    position: 'fixed',
    top: '1rem',
    left: 0,
    margin: '8rem 1rem 0 2rem',
    backgroundColor: 'white',
    padding: '1rem',
    borderRadius: '1rem',
    color: 'black',
    border: '1px solid black',
    opacity: 0.9
  }
}

export default App;
