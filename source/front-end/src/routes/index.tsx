import { Route, BrowserRouter as Router, Routes } from 'react-router-dom'
import SuggestionForm from '../pages/suggestion-form'
import SuggestionList from '../pages/suggestion-list'
import DefineManager from '../pages/define-manager'
import DefineChampion from '../pages/define-champion'
import Employee from '../pages/employee'

function SuggestionSystemRouter() {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<SuggestionForm />} />
                <Route path="/suggestion-list" element={<SuggestionList />} />
                <Route path="/admin/define-manager" element={<DefineManager />} />
                <Route path="/admin/define-champion" element={<DefineChampion />} />
                <Route path="/employee" element={<Employee />} />
                <Route path="*" element={<div>404 Not Found</div>} />
            </Routes>
        </Router>
    )
}

export default SuggestionSystemRouter
