import { useState, useEffect, useMemo } from 'react';
import './App.css';
import Typewriter from 'typewriter-effect';
import parse from 'html-react-parser';
import { useSearchParams } from 'react-router-dom';
import toast, { Toaster } from 'react-hot-toast';
import uEmojiParser from 'universal-emoji-parser';

const DungeonMaster = props => {



  const StatusBar = props => {
    return (
      <div style={styles.statusBar}>
        <GoldBalance 
          {...props}
        />
        <HealthBar 
          {...props}
        />
        <EnergyBar 
          {...props}
        />
      </div>
    )
  }

  const GoldBalance = props => {
    return (
      <div style={styles.goldBalance}>
        <h3>Gold: {props.gold}</h3>
      </div>
    )
  }

  const HealthBar = props => {
    const [healthColor, setHealthColor] = useState('green');

    useEffect(() => {
      function getColor(value){
        //value from 0 to 1
        var hue=((value)*120).toString(10);
        return ["hsl(",hue,",100%,50%)"].join("");
      }
      setHealthColor(getColor(props.health / 100));
    }, [props.health])

    const healthBarStyle = {
      position: 'fixed',
      top: '1rem',
      right: '15rem',
      margin: '8rem 1rem 0 0',
      padding: '1rem',
      borderRadius: '1rem',
      color: 'black',
      border: '1px solid black',
      opacity: 0.9,
      backgroundColor: healthColor,
    }

    return (
      <div style={healthBarStyle}>
        <h3>Health: {props.health}</h3>
      </div>
    )
  }

  const EnergyBar = props => {
    const [energyColor, setEnergyColor] = useState('blue');

    useEffect(() => {
      function getColor(value){
        //value from 0 to 1
        var hue=((value)*240).toString(10);
        return ["hsl(",hue,",100%,50%)"].join("");
      }
      setEnergyColor(getColor(props.energy / 100));
    }, [props.energy])

    const energyBarStyle = {
      position: 'fixed',
      top: '1rem',
      right: '31rem',
      margin: '8rem 1rem 0 0',
      padding: '1rem',
      borderRadius: '1rem',
      color: 'black',
      border: '1px solid black',
      opacity: 0.9,
      backgroundColor: energyColor,
    }
    return (
      <div style={energyBarStyle}>
        <h3>Energy: {props.energy}</h3>
      </div>
    )
  }

  const Inventory = props => {
    return (
      <div style={styles.inventory}>
        <h3>Inventory:</h3>
        <ul>
          {props.inventory.map((i) => {
            return (
              <li key={i}>{i}</li>
            )
          })}
        </ul>
      </div>
    )
  }

  return (
    <>
      <StatusBar 
        {...props}
      />
      <Inventory
        {...props}
      />
    </>
  )
}

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
  const [adTime, setAdTime] = useState(false);
  const [adResponse, setAdResponse] = useState('');
  const [adLinks, setAdLinks] = useState([]);
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
    },
    {
      name: 'Nikola Tesla',
      intro: 'Introduce yourself.',
      index: 9
    },
  ];

  useEffect(() => {
    handleClear();
  }, [ai])
  
  const advertisers = useMemo(() => {
    return [
      "Coca-Cola", 
      "Pepsi",
      "McDonald's",
      "Burger King",
      "Wendy's",
      "Taco Bell",
      "KFC",
      "Pizza Hut",
      "Subway",
      "Domino's",
      "Starbucks",
      "Dunkin'",
      "Walmart",
      "Target",
      "Amazon",
      "Apple",
      "Google",
      "Microsoft",
      "Facebook",
      "Twitter",
      "Instagram",
      "Snapchat",
      "TikTok",
      "Reddit",
      "Twitch",
      "YouTube",
      "Netflix",
      "Spotify",
      "Hulu",
      "Disney+",
      "HBO Max",
    ];
  }, []);

  useEffect(() => {
    //display an ad every 2.5 minutes
    const interval = setInterval(() => {
      setAdTime(true);
    }, 150000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const setAds = async () => {
      const response = await getResponse(advertisers[Math.floor(Math.random() * advertisers.length)], convo, "ad", ai);
      setAdResponse(response.response);
    }
    if (adTime) {
      setAdTime(false);
      if (ai !== 6) {
        if (prompts[prompts.length - 1] !== "ad") {
          setAds();
        }
      }
    }
  }, [adTime]);

  useEffect(() => {
    if (adResponse === '') return;
      setPrompts([...prompts, "ad"]);
      // find start of json object
      const start = adResponse.indexOf('{');
      var jsonStr = adResponse.substring(start);
      // strip html tags from json object
      jsonStr = jsonStr.replace(/(<([^>]+)>)/gi, "");
      // remove trailing characters after json object
      jsonStr = jsonStr.substring(0, jsonStr.indexOf('}') + 1);
      // parse json object
      const obj = JSON.parse(jsonStr);
      // set ad link
      let newLinksArray = [...adLinks];
      newLinksArray[responses.length] = obj.link;
      setAdLinks(newLinksArray);
      // set ad response
      let ad = uEmojiParser.parseToUnicode(adResponse.substring(0, start));
      setResponses([...responses, ad]);
      setAdResponse('');
  }, [adResponse, prompts, responses]);

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
    body.response = body.response.replace(/&amp;/g, '&');
    // body.response = body.response.replace(/""/g, '"');
    const endSymbol = body.response.indexOf('|||');
    body.response = body.response.slice(0, endSymbol).trim();
    body.response = uEmojiParser.parseToUnicode(body.response);
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
    const buttonsJSX = keyArray.map((k) => {
      return (
        <div
          key={k.choiceId}
          className="choiceButton"
          onClick={() => {
            window.handleChoiceClick(k.choiceId, k.gold, k.health, k.cost, k.item, k.energy, k.useItem);
          }}
        >{k.buttonText}{k.cost ? ` (-${k.cost} gold)` : ''}{k.useItem ? ` (-${k.useItem})` : ''}
        </div>
      );
    });
    const fullButtonsJSX = (
      <div style={{display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'center'}}>
        {buttonsJSX}
      </div>
    );
    return fullButtonsJSX;
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
    console.log(e.target.value)
    setAi(Number(e.target.value));
  }

  window.handleChoiceClick = (choice, goldUpdate, healthUpdate, cost, item, energyUpdate, loseItem) => {
    var totalGold = -cost || 0;
    if (cost) {
      if (gold < cost) {  
        setLoading(false);
        toast('Not enough gold!', {
          style: {
          background: 'gold',
          color: 'black',
          },
        });
        return false;
      }
      toast.error(`-${cost} gold`, {
        style: {
          background: 'gold',
          color: 'black',
        },
      })
    }
    setPromptInput(choice);
    handleChoice(choice);
    if (healthUpdate) {
      if (healthUpdate > 0) {
        toast.success(`+${healthUpdate} health`, {
          style: {
            background: 'green',
            color: 'white',
          },
        })
      } else {
        toast.error(`${healthUpdate} health`, {
          style: {
            background: 'red',
            color: 'white',
          },
        })
      }
      setHealth(health + healthUpdate);
    }
    if (goldUpdate) {
      if (goldUpdate > 0) {
        toast.success(`+${goldUpdate} gold`, {
          style: {
            background: 'gold',
            color: 'black',
            },
          })
      } else {
        toast.error(`${goldUpdate} gold`, {
          style: {
            background: 'gold',
            color: 'black',
          },
        })
      }
      totalGold += goldUpdate;
    }
    setGold(gold + totalGold > 0 ? gold + totalGold : 0);
    if (item) {
      setInventory([...inventory, item]);
      toast.success(`You got a ${item}!`, {
        style: {
          background: 'white',
          color: 'black',
        },
      });
    }
    if (loseItem) {
      if (!inventory.includes(loseItem)) return toast.error(`You don't have a ${loseItem}!`, {
        style: {
          background: 'white',
          color: 'black',
        },
      });
      const newInventory = inventory.filter(i => i !== loseItem);
      setInventory(newInventory);
      toast.success(`You used a ${loseItem}!`, {
        style: {
          background: 'white',
          color: 'black',
        },
      });
    }
    if (energyUpdate) {
      if (energyUpdate > 0) {
        toast.success(`+${energyUpdate} energy`, {
          style: {
            background: 'blue',
            color: 'white',
          },
        })
      } else {
        toast.error(`${energyUpdate} energy`, {
          style: {
            background: 'blue',
            color: 'white',
          },
        })
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

  

  const localProps = {
    handleSubmit,
    handleNameChange,
    handleClear,
    handleAiChange,
    aiUpdated,
    ai,
    name,
    promptInput,
    setPromptInput,
    prompts,
    responses,
    loading,
    convoActive,
    inventory,
    buttons,
    setButtons,
    setConvoActive,
    setInventory,
    setHealth,
    setEnergy,
    setGold,
    health,
    energy,
    gold,
  }


  useEffect(() => {
    if (energy <= 0) {
      toast.error('You ran out of energy! -1/2 Health', {
        style: {
          background: 'red',
          color: 'white',
          },
        });
      toast.success('You are now rested. +100 energy', {
        style: {
          background: 'blue',
          color: 'white',
        },
      });
      setHealth(Math.floor(health / 2));
      setEnergy(100);
    }
  }, [energy]);

  

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
        position="top-right"
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
        <div style={styles.navBar}>
          <div style={styles.aiSelect}>
            <select style={styles.aiDropdown} value={ai} onChange={(e) => handleAiChange(e)}>
              {aiList.map((ai, index) => (
                <option style={styles.aiOption} key={index} value={index}>{ai.name}</option>
              ))}
            </select>
          </div>
          <div style={styles.clearButton} onClick={() => handleClear()}>Reset</div>
        </div>
        <div style={styles.mainContainer}>
          {aiList[ai].name === 'Dungeon Master' ? <DungeonMaster {...localProps}/> : null}
        <form onSubmit={handleSubmit}>
          {/* <div style={styles.nameInputContainer}>
            <label>
              Name:{" "}
              <input type="text" value={name} onChange={handleNameChange}/>
            </label>
          </div> */}
          <div style={styles.promptContainer}>
            {loading ? <LoadingAni /> : null}
            {ai === 6 && !loading ? <div style={{textAlign: 'center', width: '100vw'}}><Buttons /></div>: null}
            {ai !==6 &&
              <>
                <label>
                  <input id="promptInput" style={styles.promptInput} type="text" value={promptInput} autocomplete="off" onChange={(e) => setPromptInput(e.target.value)} />
                </label>
                <input id="submitButton" style={styles.promptSubmit} type="submit" value="Submit" />
              </>
            }
          </div>
        </form>
        <div>
          {prompts.length === 0 && loading  && <LoadingAni />}
          {prompts.map((prompt, index) => (
            <div key={index}>
              {index !== 0 &&
                <p style={styles.userPrompt}>{prompt !== 'ad' ? prompt : null }</p>}
              {prompt === 'ad' && (
                <a href={adLinks[index]} target="_blank" rel="noopener noreferrer">
                  <div style={styles.aiAd}>
                    <div style={styles.aiAdBadge}>ad</div>
                    <Typewriter
                      options={{
                        strings: [index < responses.length ? responses[index] : ''],
                        autoStart: true,
                        delay: 10,
                        loop: false,
                        deleteSpeed: Infinity,
                        cursor: ''
                      }}
                    />
                  </div>
                </a>
              )}
              {prompt !== 'ad' && (
                <div style={styles.aiRes}>
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
                </div>
              )}
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
  navBar: {
    position: 'fixed',
    top: 0,
    left: 0,
    width: '100vw',
    height: '10rem',
    backgroundColor: '#222',
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    padding: '0 2rem',
    zIndex: 100,
  },
  aiSelect: {
    padding: '1rem',
    margin: '0 2rem',
  },
  aiDropdown: {
    minWidth: '20rem',
    height: '4rem',
    fontSize: '2rem',
    backgroundColor: 'white',
    textAlign: 'center',
    color: 'black',
    border: 'none',
    borderRadius: '1rem',
    padding: '0 1rem',
  },
  aiOption: {
    fontSize: '1rem',
    backgroundColor: 'white',
    textAlign: 'center',
    color: 'black',
    border: 'none',
    borderRadius: '1rem',
    padding: '0 1rem',
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
    width: 'calc(100vw - 150px)',
    height: '4rem',
    border: 'none',
    fontSize: '1.5rem',
    backgroundColor: 'white',
    color: 'black',
    lineHeight: '1.5rem',
    margin: '1rem'
  },
  promptSubmit: {
    position: 'fixed',
    bottom: '0.25rem',
    right: '1.25rem',
    width: '100px',
    height: '3.5rem',
    border: 'none',
    borderRadius: '1rem',
    fontSize: '1.5rem',
    backgroundColor: 'gray',
    color: 'white',
    lineHeight: '1.5rem',
    margin: '1rem',
    cursor: 'pointer',
    zIndex: 150
  },
  nameInputContainer: {
    position: 'fixed',
    top: 0,
    left: 0,
    margin: '1rem',
    backgroundColor: 'black',
    padding: '1rem',
    borderRadius: '1rem',
    color: 'white',
    zIndex: 100
  },
  loadingAnimation: {
    position: 'fixed',
    bottom: 0,
    left: 0,
    marginLeft: '0.75rem'
  },
  clearButton: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    top: '2rem',
    right: '2rem',
    border: 'none',
    fontSize: '1.5rem',
    backgroundColor: 'red',
    opacity: 0.7,
    borderRadius: '1rem',
    color: 'white',
    lineHeight: '1rem',
    margin: '1rem',
    height: '3rem',
    width: '100px',
    cursor: 'pointer',
    zIndex: 100
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
    color: 'white',
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
    color: 'white',
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
  },
  aiRes: {
    color: 'white',
    fontSize: '1.5rem',
    margin: '1rem'
  },
  aiAd: {
    color: 'black',
    fontSize: '1.5rem',
    margin: '1rem',
    backgroundColor: 'white',
    padding: '1rem',
    borderRadius: '1rem',
    border: '1px solid blue',
  },
  aiAdBadge: {
    position: 'relative',
    backgroundColor: 'blue',
    color: 'white',
    padding: '0.5rem',
    borderRadius: '0.5rem',
    fontSize: '1rem',
    margin: '0.5rem',
    width: '1.5rem',
    textAlign: 'center',
    right: '0.5rem',
    top: '0.5rem'
  }

}

export default App;
