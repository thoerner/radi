export const LoadingAni = props => {

    return (
      <div style={props.isMobile ? styles.loadingAnimationMobile : styles.loadingAnimation}>
        <div className="lds-grid"><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div></div>
      </div>
    )
  }

  const styles = {
    loadingAnimation: {
        position: 'fixed',
        bottom: 0,
        left: 0,
        marginLeft: '0.75rem'
      },
    loadingAnimationMobile: {
        position: 'fixed',
        top: '1rem',
        left: '1rem',
        width: '2rem',
        height: '2rem',
        zIndex: '100',
    }
  }