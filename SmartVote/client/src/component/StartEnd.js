import React from "react";

const StartEnd = (props) => {
  const btn = {
    display: "block",
    padding: "21px",
    margin: "7px",
    minWidth: "max-content",
    textAlign: "center",
    width: "333px",
    alignSelf: "center",
    backgroundColor: "#B298E7", // Lavender Purple
    color: "white",
    border: "none",
    borderRadius: "8px",
    fontSize: "16px",
    fontWeight: "bold",
    cursor: "pointer",
    boxShadow: "0 4px 8px rgba(178, 152, 231, 0.3)",
    transition: "all 0.3s ease",
  };

  const btnHover = {
    backgroundColor: "#9a7ed9", // Darker Lavender Purple
    transform: "translateY(-2px)",
    boxShadow: "0 6px 12px rgba(178, 152, 231, 0.4)",
  };

  return (
    <div
      className="container-main"
      style={{ borderTop: "1px solid", marginTop: "0px" }}
    >
      {!props.elStarted ? (
        <>
          {!props.elEnded ? (
            <>
              <div className="container-item">
                <button 
                  type="submit" 
                  style={btn}
                  onMouseEnter={(e) => {
                    Object.assign(e.target.style, btnHover);
                  }}
                  onMouseLeave={(e) => {
                    Object.assign(e.target.style, btn);
                  }}
                >
                  Start Election {props.elEnded ? "Again" : ""}
                </button>
              </div>
            </>
          ) : (
            <div className="container-item">
              <center>
                <p>Re-deploy the contract to start election again.</p>
              </center>
            </div>
          )}
          {props.elEnded ? (
            <div className="container-item">
              <center>
                <p>The election ended.</p>
              </center>
            </div>
          ) : null}
        </>
      ) : (
        <>
          <div className="container-item">
            <center>
              <p>The election started.</p>
            </center>
          </div>
          <div className="container-item">
            <button
              type="button"
              onClick={props.endElFn}
              style={btn}
              onMouseEnter={(e) => {
                Object.assign(e.target.style, btnHover);
              }}
              onMouseLeave={(e) => {
                Object.assign(e.target.style, btn);
              }}
            >
              End
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default StartEnd;