import './App.css'
import {BrowserRouter, Route, Routes} from 'react-router-dom'
import Layout from './components/layout/Layout.jsx'
import Home from './pages/Home.jsx'
import GaugeConverter from './pages/knitting/converter/GaugeConverter.jsx'
import StitchChangeCalculator from "./pages/knitting/converter/StitchChangeCalculator.jsx";

function App() {

    return (
        <>
            <BrowserRouter basename={import.meta.env.VITE_BASE_URL}>
                <Routes>
                    <Route element={<Layout />}>
                        <Route path='/' element={<Home/>}/>
                        <Route path='/knitting/converter/gauge' element={<GaugeConverter/>}/>
                        <Route path='/knitting/converter/stitch' element={<StitchChangeCalculator/>}/>
                    </Route>
                </Routes>
            </BrowserRouter>
        </>
    )
}

export default App
