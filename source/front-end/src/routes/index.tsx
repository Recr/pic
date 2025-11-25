import { Route, BrowserRouter as Router, Routes } from 'react-router-dom'
import SuggestionForm from '../pages/suggestion-form'
import SuggestionList from '../pages/suggestion-list'

function SuggestionSystemRouter() {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<SuggestionForm />} />
                <Route path="/suggestion-list" element={<SuggestionList />} />
            </Routes>
        </Router>
    )
}

export default SuggestionSystemRouter
