import { Route, BrowserRouter as Router, Routes } from 'react-router-dom'
import SuggestionForm from '../pages/suggestion-form'
import SuggestionList from '../pages/suggestion-list'
import DefineManager from '../pages/define-manager'
import DefineChampion from '../pages/define-champion'

function SuggestionSystemRouter() {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<SuggestionForm />} />
                <Route path="/suggestion-list" element={<SuggestionList />} />
                <Route path="/admin/define-manager" element={<DefineManager />} />
                <Route path="/admin/define-champion" element={<DefineChampion />} />
            </Routes>
        </Router>
    )
}

export default SuggestionSystemRouter
