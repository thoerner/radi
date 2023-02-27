import { useState, useEffect, useMemo } from 'react';
import { LoadingAni } from './LoadingAni';
import { Buttons } from './DungeonMaster';
import { useWindowDimensions } from '../utils/tools';

export const PromptBar = props => {
    const [submitButtonValue, setSubmitButtonValue] = useState('Submit');
    const [elipsis, setElipsis] = useState('...');
    const { width } = useWindowDimensions();

    const isMobile = width < 600;

    const { promptInput, setPromptInput, handleSubmit, loading, ai } = props;

    useEffect(() => {
        setInterval(() => {
            setElipsis(elipsis => elipsis.length < 3 ? elipsis + '.' : '.');
        }, 500);
    }, []);

    useEffect(() => {
        if (isMobile && loading) {
            setSubmitButtonValue(elipsis);
        } else if (isMobile) {
            setSubmitButtonValue('>');
        } else {
            setSubmitButtonValue('Submit');
        }
    }, [loading, elipsis]);

    const handleInputChange = e => {
        setPromptInput(e.target.value);
    }

    useEffect(() => {
        var input = document.getElementById("promptInput");
        input.addEventListener("keyup", function(event) {
            if (event.key === "Enter") {
                if (event.shiftKey) {
                } else {
                    event.preventDefault();
                    document.getElementById("submitButton").click();
                }
            }
        });
    }, []);
  
    return (
      <form onSubmit={handleSubmit}>
            <div style={isMobile? styles.promptContainerMobile : styles.promptContainer}>
              {loading && !isMobile ? <LoadingAni styles={props.styles}/> : null}
              {ai === 6 && !loading ? <div style={{textAlign: 'center', width: '100vw'}}><Buttons {...props} /></div>: null}
              {ai !==6 &&
                <>
                  <span style={isMobile ? styles.promptMobile : styles.prompt}>
                    <textarea className="scroll" id="promptInput" 
                        style={isMobile ? styles.promptInputMobile : styles.promptInput} 
                        value={promptInput} 
                        autoComplete="off" 
                        rows="1"
                        onChange={handleInputChange} 
                    />
                  </span> 
                  <span id="submitButton" 
                        style={isMobile ? styles.promptSubmitMobile : styles.promptSubmit} onClick={handleSubmit}
                  >
                    {submitButtonValue}
                  </span>
                </>
              }
            </div>
          </form>
    )
    
}

const styles = {
    promptContainerMobile: {
        position: 'fixed',
        bottom: '0',
        left: '0',
        width: '100vw',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'black',
        zIndex: '100',
        padding: '1rem',
        boxSizing: 'border-box',
    },
    promptMobile: {
        display: 'flex',
        justifyContent: 'flex-start',
        width: '96vw',
        height: '2rem',
        fontSize: '1rem',
        fontWeight: '400',
        boxSizing: 'border-box',
        borderRadius: '0.5rem',
        border: 'none',
        backgroundColor: 'white',
        color: 'black',
        outline: 'none',
    },
    prompt: {
        display: 'flex',
        justifyContent: 'flex-start',
        width: 'calc(100vw - 150px)',
        height: '3rem',
        border: 'none',
        borderRadius: '0.5rem',
        padding: '0.25rem',
        backgroundColor: 'white',
        color: 'black',
        margin: '1rem'
    },
    promptInput: {
        padding: '0 0.5rem',
        width: '84vw',
        height: '3rem',
        border: 'none',
        fontSize: '1.5rem',
        backgroundColor: 'white',
        color: 'black',
        lineHeight: '3rem',
        MsOverflowStyle: 'none', 
        scrollbarWidth: 'none', 
    },
    promptInputMobile: {
        width: 'calc(96vw - 3.25rem)',
        height: '1.8rem',
        fontSize: '1rem',
        lineHeight: '1rem',
        fontWeight: '400',
        padding: '0.5rem',
        boxSizing: 'border-box',
        backgroundColor: 'transparent',
        borderRadius: '0.5rem',
        color: 'black',
        outline: 'none',
        border: 'none',
        MsOverflowStyle: 'none', 
        scrollbarWidth: 'none', 
    },
    promptSubmitMobile: {
        position: 'fixed',
        bottom: '1.25rem',
        right: '1.25rem',
        width: '2rem',
        height: '1.5rem',
        backgroundColor: '#0077ff',
        color: 'white',
        border: 'none',
        borderRadius: '5px',
        cursor: 'pointer',
        textAlign: 'center',
        zIndex: '150',
    },
    promptContainer: {
        position: 'fixed',
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'space-between',
        bottom: 0,
        left: 0,
        width: 'calc(100vw - 100px)',
        height: '6rem',
        backgroundColor: 'black',
        paddingLeft: '100px',
      },
      
      promptSubmit: {
        position: 'fixed',
        bottom: '0.75rem',
        right: '1.25rem',
        width: '100px',
        height: '3rem',
        border: 'none',
        borderRadius: '1rem',
        fontSize: '1.5rem',
        backgroundColor: '#0077ff',
        color: 'white',
        lineHeight: '3rem',
        margin: '1rem',
        cursor: 'pointer',
        textAlign: 'center',
        zIndex: 150
      },
}