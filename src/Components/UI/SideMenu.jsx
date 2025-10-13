export default function SideMenu({feature, onClose }) {
    if (!feature) return null;

    return (
        <div style={{
            position: 'absolute',
            top: 20,
            right: 0,
            width: '300px',
            height: '70vh',
            backgroundColor: "#fff",
            padding: "20px",
            overflowY: "auto",
            zIndex: 30,
            boxShadow: "-2px 0 5px rgba(0,0,0,0.2)"
            }}>
                <button
                    onClick={onClose}
                    style={{
                    position: "absolute",
                    top: 10,
                    right: 10,
                    background: "none",
                    border: "none",
                    fontSize: "1.5rem",
                    cursor: "pointer",
                    }}
                >
                    X
                    </button>
            <h3>Hex Details</h3>
            <pre style={{ whiteSpace: "pre-wrap", wordWrap: "break-word" }}>
                {JSON.stringify(feature, null, 2)}
            </pre>
            </div>
    
    )
}