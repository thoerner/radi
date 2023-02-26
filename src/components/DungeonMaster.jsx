import { useState, useEffect } from 'react';

export const Buttons = props => {

    // props: styles, buttons
    const { styles } = props;
    return (
      <div style={styles.buttons}>
        {props.buttons}
      </div>
    )
  }

export const DungeonMaster = props => {

    // props: styles, gold, health, energy, inventory, setGold, setHealth, setEnergy, setInventory
    // styles: statusBar, goldBalance, healthBar, energyBar, inventory

    const { styles } = props;

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