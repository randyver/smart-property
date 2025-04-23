export default function Home() {
return(
    // there is redirection to /dashboard
    <main>
        <h1 className="text-4xl font-bold text-center mt-20">Welcome to the Climate Risk Property Dashboard</h1>
        <p className="text-lg text-center mt-4">Analyzing climate risks in real estate.</p>
        <div className="flex justify-center mt-10">
            <a href="/dashboard" className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition duration-200">Go to Dashboard</a>
        </div>
    </main>
)

}