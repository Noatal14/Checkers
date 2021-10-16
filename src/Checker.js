export default function Checker(props) {
    return (
        <div onClick={props.onClick} id={`checker${props.coordinate}`} className={`checker ${props.color}`}>
            {props.piece && 
                <div
                    id={`piece${props.coordinate}`}
                    className={`piece ${props.piece}`}>
                </div>
            }
        </div>
    )
}