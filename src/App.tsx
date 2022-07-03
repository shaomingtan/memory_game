import Canvas from './components/Canvas'

function App() {
  const wordsMapping = {
    "forest":	"forêt",
    "sibling":	"frère et sœur",
    "cereal":	"céréale",
    "desk":	"bureau",
    "camel":	"chameau",
    "butter":	"beurre",
    "bicycle":	"vélo",
    "railroad":	"chemin de fer",
    "folder":	"dossier",
    "weekly":	"hebdomadaire",
    "hungry":	"faim",
    "limestone":	"calcaire",
  }
  return <Canvas wordsMapping={wordsMapping}/>
}

export default App;
