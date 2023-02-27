import { useState, useEffect, useMemo, useRef } from 'react';
import './App.css';
import Typewriter from 'typewriter-effect';
import { useSearchParams } from 'react-router-dom';
import toast, { Toaster } from 'react-hot-toast';
import uEmojiParser from 'universal-emoji-parser';
import { DungeonMaster } from './components/DungeonMaster';
import { PromptBar } from './components/PromptBar';
import { useWindowDimensions } from './utils/tools';

function scrollToBottom() {
  const mainCardElement = document.getElementById('mainCard');
  mainCardElement.scrollTop = mainCardElement.scrollHeight;
}

function useInterval(callback, delay) {
  const intervalRef = useRef();
  const callbackRef = useRef(callback);

  // Remember the latest callback:
  //
  // Without this, if you change the callback, when setInterval ticks again, it
  // will still call your old callback.
  //
  // If you add `callback` to useEffect's deps, it will work fine but the
  // interval will be reset.

  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  // Set up the interval:

  useEffect(() => {
    if (typeof delay === 'number') {
      intervalRef.current = window.setInterval(() => callbackRef.current(), delay);

      // Clear interval if the components is unmounted or the delay changes:
      return () => window.clearInterval(intervalRef.current);
    }
  }, [delay]);
  
  // Returns a ref to the interval ID in case you want to clear it manually:
  return intervalRef;
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
  const [isMobile, setIsMobile] = useState(false);
  const [roaming, setRoaming] = useState(false);

  const { width } = useWindowDimensions();

  useEffect(() => {
    setIsMobile(width < 600);
  }, []);

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
    {
      name: 'Big Gay Al',
      intro: 'Introduce yourself.',
      index: 10
    },
    { 
      name: 'Larry the Liar',
      intro: 'Introduce yourself.',
      index: 11
    },
  ];

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

  // ad timer
  useEffect(() => {
    const interval = setInterval(() => {
      setAdTime(true);
    }, 150000);
    return () => clearInterval(interval);
  }, []);

  // get and set ad
  useEffect(() => {
    const setAds = async () => {
      const response = await getResponse(advertisers[Math.floor(Math.random() * advertisers.length)], convo, "ad", ai);
      setAdResponse(response.response);
      setLoading(false);
    }
    if (adTime) {
      setAdTime(false);
      if (ai !== 6) {
        if (prompts[prompts.length - 1] !== "ad") {
          setLoading(true);
          setAds();
        }
      }
    }
  }, [adTime]);

  // create response from ad
  useEffect(() => {
    if (adResponse === '') return;
      setPrompts([...prompts, "ad"]);
      const start = adResponse.indexOf('{');
      var jsonStr = adResponse.substring(start);
      jsonStr = jsonStr.replace(/(<([^>]+)>)/gi, "");
      jsonStr = jsonStr.substring(0, jsonStr.indexOf('}') + 1);
      const obj = JSON.parse(jsonStr);
      let newLinksArray = [...adLinks];
      newLinksArray[responses.length] = obj.link;
      setAdLinks(newLinksArray);
      let ad = uEmojiParser.parseToUnicode(adResponse.substring(0, start)).trim();
      setResponses([...responses, ad]);
      setAdResponse('');
  }, [adResponse, prompts, responses]);

  // get ai response from api
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
    let body = await response.json();
    if (response.status !== 200) return 'Error: ' + body.error;

    body.response = body.response.replace(/&lt;/g, '<');
    body.response = body.response.replace(/&gt;/g, '>');
    body.response = body.response.replace(/&quot;/g, '"');
    body.response = body.response.replace(/&#39;/g, '\'');
    body.response = body.response.replace(/&amp;/g, '&');
    let endSymbol = body.response.indexOf('|||');
    body.response = body.response.slice(0, endSymbol).trim();
    body.response = uEmojiParser.parseToUnicode(body.response);
    if (ai === 6) {
      let keyStart = body.response.indexOf('[{');
      let keyEnd = body.response.indexOf('}]') + 2;
      let keyList = body.response.slice(keyStart, keyEnd);
      body.response = body.response.replace(keyList, '');
      setButtons(await createButtonsJSX(keyList));
    }

    return body;
  };

  const createButtonsJSX = async (keys) => {
    const keyArray = await JSON.parse(keys);
    const buttonJsx = (
      <div style={{display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'center'}}>
        {keyArray.map((k) => {
          return (
            <div
              key={k.choiceId}
              className="choiceButton"
              onClick={() => {
                window.handleChoiceClick(k.choiceId, k.gold, k.health, k.cost, k.item, k.energy, k.useItem);
              }}
            >
              {k.buttonText}{k.cost ? ` (-${k.cost} gold)` : ''}{k.useItem ? ` (-${k.useItem})` : ''}
            </div>
          );
        })}
      </div>
    );
    return buttonJsx;
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
    setResponses([...responses, response.response.trim()]);
    setPrompts([...prompts, intro])
  }

  useEffect(() => { 
    if (!convoActive) {
      setLoading(true);
      let seed = Math.floor(Math.random() * 1000000000);
      getConvo(seed);
    }
  }, [convoActive]);

  
  // scroll to bottom of chat
  const intervalRef = useInterval(() => {
    if (!roaming) {
      const mainCardElement = document.getElementById('mainCard');
      mainCardElement.scrollTop = mainCardElement.scrollHeight;
    } else {
      // window.clearInterval(intervalRef.current);
    }
  }, 500);
  
  // detect when user has scrolled
  useEffect(() => {
    var mainCardElement = document.getElementById('mainCard');
    let prevScrollPos = mainCardElement.scrollTop;
    const handleScroll = () => {
      const currentScrollPos = mainCardElement.scrollTop;
      if (currentScrollPos > prevScrollPos) {
        // scrolling up
        setRoaming(true);
      } else if (currentScrollPos < prevScrollPos) {
        // scrolling down
        console.log("scrolling up");
        setRoaming(true);
      }
      prevScrollPos = currentScrollPos;

      if (mainCardElement.scrollTop + mainCardElement.clientHeight >= mainCardElement.scrollHeight) {
        // reached end of scrolling
        console.log("reached end of scrolling");
        setRoaming(false);
      }
    }
    mainCardElement.addEventListener('scroll', handleScroll);
    return () => mainCardElement.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    handleClear();
    if (!convoActive) {
      setLoading(true);
      let seed = Math.floor(Math.random() * 1000000000);
      getConvo(seed);
    }
  }, [ai])



  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading) return;
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

  const handleAiChange = (e) => {
    setAiUpdated(true);
    setAi(Number(e.target.value));
  }

  const appProps = {
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
    styles
  }

  // Dungeon Master Logic

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

  useEffect(() => {
    if (health <= 0) {
      toast('You died!');
      handleClear();
    }
  }, [health]);

  const handleChoice = async (choice) => {
    const prompt = choice;
    setPromptInput('');
    setPrompts([...prompts, prompt]);
    setLoading(true);
    const response = await getResponse(name, convo, prompt, ai);
    setResponses([...responses, response.response.trim()]);
    setConvo(response.convo);
    setLoading(false);
    setTimeout(() => {
      scrollToBottom();
    }, 100);
  };

  useEffect(() => {
    scrollToBottom();
  }, [prompts, responses]);

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

  const removeLineBreaks = (text) => {
    return text.replace(/(\r\n|\n|\r)/gm, "");
  }


  return (
    <div>
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
      <div className="App">
        <div style={isMobile ? styles.navBarMobile : styles.navBar}>
          <div style={isMobile ? styles.aiSelectMobile : styles.aiSelect}>
            <select style={isMobile ? styles.aiDropdownMobile : styles.aiDropdown} value={ai} onChange={(e) => handleAiChange(e)}>
              {aiList.map((ai, index) => (
                <option style={isMobile ? styles.aiOptionMobile : styles.aiOption} key={index} value={index}>{ai.name}</option>
              ))}
            </select>
          </div>
          <div style={isMobile ? styles.clearButtonMobile : styles.clearButton} onClick={() => handleClear()}>♺</div>
        </div>
        <div style={styles.mainContainer}>
          {aiList[ai].name === 'Dungeon Master' ? <DungeonMaster {...appProps}/> : null}
          <PromptBar {...appProps}/>
          <div style={styles.mainCard} id="mainCard">
            <div style={{flex: '1 1 auto'}}></div>
            {prompts.map((prompt, index) => (
              <div style={styles.cardContent} key={index}>
                {index !== 0 &&
                  <>
                    <p style={isMobile ? styles.userPromptMobile : styles.userPrompt}>{prompt !== 'ad' ? prompt : null }</p>
                  </>
                }
                {prompt === 'ad' && (
                  <a href={adLinks[index]} target="_blank" rel="noopener noreferrer">
                    <div style={isMobile ? styles.aiAdMobile : styles.aiAd}>
                      <div style={styles.aiAdBadge}>ad</div>
                      <Typewriter
                        options={{
                          strings: [index < responses.length ? responses[index] : ''],
                          autoStart: true,
                          delay: 10,
                          loop: false,
                          deleteSpeed: Infinity,
                          cursor: null
                        }}
                      />
                    </div>
                  </a>
                )}
                {prompt !== 'ad' && (
                  <div style={isMobile ? styles.aiResMobile : styles.aiRes}>
                    <Typewriter
                      options={{
                        strings: [index < responses.length ? responses[index] : ''],
                        autoStart: true,
                        delay: 10,
                        loop: false,
                        deleteSpeed: Infinity,
                        cursor: null
                      }}
                    />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

const styles = {
  mainContainer: {
    position: 'relative',
    backgroundColor: 'white',
    padding: '0.5rem',
    borderRadius: '1rem',
    width: '95vw',
    height: 'calc(100vh - 15rem)',
  },
  mainCard: {
    display: 'flex',
    flexDirection: 'column',
    position: 'relative',
    backgroundColor: '#111',
    padding: '0.5rem',
    borderRadius: '1rem',
    width: 'calc(95vw - 1rem)',
    overflowY: 'auto',
    height: 'calc(100vh - 16rem)',
  },
  cardContent: {
    width: '100%',
    minHeight: 'fit-content',
  }, 

  userPrompt: {
    color: 'yellow',
    fontSize: '1.5rem',
  },
  userPromptMobile: {
    color: 'yellow',
    fontSize: '1rem',
  },

  aiRes: {
    color: 'white',
    fontSize: '1.5rem',
    width: '90vw',
  },
  aiResMobile: {
    color: 'white',
    fontSize: '1rem',
    width: '90vw',
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
  aiAdMobile: {
    color: 'black',
    fontSize: '1rem',
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
  },

  navBar: {
    position: 'fixed',
    top: 0,
    left: 0,
    width: '100vw',
    height: '5rem',
    backgroundColor: '#222',
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    padding: '0',
    zIndex: 100,
  },
  navBarMobile: {
    position: 'fixed',
    top: 0,
    left: 0,
    width: '100vw',
    height: '5rem',
    backgroundColor: '#222',
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
    padding: '0 2rem',
    zIndex: 100,
  },
  aiSelect: {
    padding: '1rem',
    margin: '0 2rem',
  },
  aiSelectMobile: {
    margin: '0',
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
  aiDropdownMobile: {
    maxWidth: '66vw',
    height: '4rem',
    fontSize: '1.5rem',
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
  aiOptionMobile: {
    fontSize: '1rem',
    backgroundColor: 'white',
    textAlign: 'center',
    color: 'black',
    border: 'none',
    borderRadius: '1rem',
    padding: '0 1rem',
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
  
  clearButton: {
    textAlign: 'center',
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
    width: '50px',
    cursor: 'pointer',
    zIndex: 100
  },
  clearButtonMobile: {
    textAlign: 'center',
    position: 'fixed',
    top: '1rem',
    right: '1rem',
    border: 'none',
    fontSize: '1.5rem',
    backgroundColor: 'red',
    opacity: 0.7,
    borderRadius: '1rem',
    color: 'white',
    lineHeight: '3rem',
    width: '50px',
    height: '50px',
    cursor: 'pointer',
    zIndex: 100
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
    right: '3rem',
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
    top: '2rem',
    left: '2rem',
    margin: '8rem 1rem 0 2rem',
    backgroundColor: 'white',
    padding: '1rem',
    borderRadius: '1rem',
    color: 'black',
    border: '1px solid black',
    opacity: 0.9
  },

  

  

     


}

export default App;
