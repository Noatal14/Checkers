import Checker from './Checker';
import './index.css'

export default function Board(props) {
    let boardRender = [];

    props.boardState.forEach((row, i) => {
        row.forEach((cell, j) => {
            boardRender.push(<Checker onClick={props.onClick} key={`${i},${j}`} coordinate={`${i},${j}`} color={i % 2 === j % 2 ? 'black' : 'white'} piece={cell && cell.pieceColor} />)
        })
    })

    return (<div id='checkers-board'>{boardRender}</div>);
}