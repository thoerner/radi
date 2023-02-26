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
  
    return (
      <form onSubmit={handleSubmit}>
            <div style={isMobile? styles.promptContainerMobile : props.styles.promptContainer}>
              {loading && !isMobile ? <LoadingAni styles={props.styles}/> : null}
              {ai === 6 && !loading ? <div style={{textAlign: 'center', width: '100vw'}}><Buttons {...props} /></div>: null}
              {ai !==6 &&
                <>
                  <label>
                    <input id="promptInput" style={isMobile ? styles.promptInputMobile : props.styles.promptInput} type="text" value={promptInput} autoComplete="off" onChange={(e) => setPromptInput(e.target.value)} />
                  </label>
                  <span id="submitButton" style={isMobile ? styles.promptSubmitMobile : props.styles.promptSubmit} onClick={handleSubmit}>{submitButtonValue}</span>
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
    promptInputMobile: {
        width: '96vw',
        height: '2rem',
        fontSize: '1rem',
        fontWeight: 'lighter',
        padding: '0.5rem',
        boxSizing: 'border-box',
        borderRadius: '0.5rem',
        border: 'none',
        backgroundColor: 'white',
        color: 'black',
        outline: 'none',
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
        zIndex: '150',
    },
}