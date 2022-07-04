# Setup and run
1. Build    
`docker build -f dockerfile -t memory:shao .`
2. Run    
`docker run -it --rm -p 3000:80 memory:shao`
2. Play    
Visit [localhost:3000](http://localhost:3000) in your browser

# Assumptions
- I assumed that the user will be playing this game on a browser and did not handle mobile or tablet screens. However this can be handled in future by sensing the viewport of the user's screen and dynamically calculating the width and height of the canvas. The canvas component can easily be tweaked to take these settings in as props.
- I also assumed that we do not need to store the session and score of a user and hence opted to build this as a static app.

# Specification
## App Component
- This component controls the game logic by shuffling the words. 
- It also starts the game and grades the result of the game.

## Canvas Component
- This component is incharge of handling the user selections and drawing them on the canvas.
- It also does some validation to prevent user from selecting similar words twice.

# Future improvements
- Currently i'm using the Canvas fillText function to display the words. This is not aesthetically pleasing. A way to improve this could be to layer a nicer UI directly below the canvas that can be styled.
- I added a bunch of validation to prevent the same word from being selected twice. It would be good to display the warning message to the user in the UI that they did something that was not expected.
- There's no way for a user to undo a selection. We could possibly add an undo button.