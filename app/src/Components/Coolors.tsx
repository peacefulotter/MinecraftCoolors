
import { useEffect, useRef, useState } from 'react'
import { DragDropContext, Droppable, Draggable, DropResult, ResponderProvided } from 'react-beautiful-dnd'

import Coolor from './Coolor';

import '../css/coolors.css';

const reorder = (list: any[], startIndex: number, endIndex: number) => {
    const result = Array.from(list);
    const [removed] = result.splice(startIndex, 1);
    result.splice(endIndex, 0, removed);
    return result;
};

export interface Color {
    texture: string;
    palette: {[key: string]: any};
    locked: boolean;
}

const Coolors = () => {
    const [nbColors, setNbColors] = useState<number>(5)
    const [coolors, setCoolors] = useState<Color[]>([])
    const [dragDisabled, setDisableDrag] = useState<boolean>(false)
    const refs = useRef<Array<any>>([])

    const randomCoolors = () => {
        (async function() {
            const CREDENTIALS = {
                method:'POST',
                body: JSON.stringify({nb: nbColors}),
                headers: new Headers()
            }

            fetch('/textures', CREDENTIALS)
                .then(res => res.json())
                .then(data => {
                    console.log(refs);
                    console.log(coolors);
                    console.log(data);
                    
                    if ( coolors.length === 0 )
                        setCoolors(data)
                    else
                    {
                        setCoolors(cs => cs.map( 
                            (c,i) => cs[i].locked ? c : data[i]))
                    }
                });
        })()
    }

    const keyDownHandler = (event: KeyboardEvent) => {
        if (event.code === "Space")
            randomCoolors()
    }

    useEffect( () => {
        randomCoolors()

        document.addEventListener('keydown', keyDownHandler);
        return () => document.removeEventListener('keydown', keyDownHandler)

    }, [])

    const onDragEnd = (result: DropResult, provided: ResponderProvided) => {
        const { source, destination } = result;

        console.log(source, destination);
        
        
        if (!destination || 
            (source.droppableId === destination.droppableId 
            && source.index === destination.index) )
            return;
    
        console.log(result);
        
        setCoolors(reorder(
            coolors,
            source.index,
            destination.index
        ))

        setDisableDrag(true)
    }

    const toggleLock = (i: number) => {
        const temp = [...coolors]
        temp[i].locked = !temp[i].locked
        setCoolors(temp)
    }

    const enableDrag = () => {
        setDisableDrag(false)
    }
    
    return (
        <div className="coolors-wrapper" >
            <DragDropContext onDragEnd={onDragEnd}>
            <Droppable 
                droppableId="droppable" 
                direction="horizontal"
            >
                {(provided, snapshot) => (
                    <div
                        ref={provided.innerRef}
                        style={{display: 'flex'}}
                        {...provided.droppableProps}
                    >
                        { coolors.map( (coolor, i) => 
                            <Draggable 
                                key={coolor.texture} 
                                draggableId={coolor.texture} 
                                isDragDisabled={dragDisabled}
                                index={i}
                            >
                                {(provided, snapshot) => (
                                    <div
                                        ref={provided.innerRef}
                                        {...provided.draggableProps}
                                        {...provided.dragHandleProps}
                                    >
                                        <Coolor 
                                            ref={el => refs.current[i] = el} 
                                            width={100 / nbColors}
                                            texture={coolor.texture}
                                            palette={coolor.palette}
                                            locked={coolor.locked}
                                            onLock={() => toggleLock(i)} 
                                            onDrag={enableDrag} />
                                        
                                    </div>
                                    
                                )}
                            </Draggable> ) 
                        }
                        {provided.placeholder}
                    </div>
                )}
            </Droppable>
            </DragDropContext>
        </div>
    )
}

export default Coolors;