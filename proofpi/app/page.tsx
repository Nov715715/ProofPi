"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { AlertCircle, CheckCircle, Award, RefreshCw, Search, Download, Eye, History, Copy, Share2 } from "lucide-react"

// Declare Pi SDK types
declare global {
  interface Window {
    Pi?: {
      init: (config: { version: string; sandbox?: boolean }) => void
      authenticate: (
        scopes: string[],
        onSuccess: (auth: { user: { username: string; uid?: string } }) => void,
        onError: (error: any) => void,
      ) => void
    }
  }
}

// Predefined skill categories and suggestions
const skillCategories = {
  "💻 Technology": [
    "Smart Contract Development",
    "Web3 Programming",
    "DeFi Knowledge",
    "Blockchain Development",
    "React Development",
    "Python Programming",
    "JavaScript Mastery",
    "AI/Machine Learning",
    "Cybersecurity",
    "Cloud Computing",
  ],
  "🎨 Creative": [
    "Graphic Design",
    "UI/UX Design",
    "Digital Art",
    "Video Editing",
    "Photography",
    "3D Modeling",
    "Animation",
    "Music Production",
    "Creative Writing",
    "Brand Design",
  ],
  "💼 Business": [
    "Project Management",
    "Digital Marketing",
    "Data Analysis",
    "Leadership",
    "Sales Excellence",
    "Customer Service",
    "Financial Analysis",
    "Strategic Planning",
    "Team Management",
    "Public Speaking",
  ],
  "🎓 Education": [
    "Online Teaching",
    "Course Creation",
    "Educational Technology",
    "Curriculum Development",
    "Student Mentoring",
    "Research Skills",
    "Academic Writing",
    "Language Teaching",
    "Training Development",
    "Knowledge Management",
  ],
}

const certificateTemplates = [
  { id: 1, name: "Professional", color: "from-blue-500 to-purple-600", icon: "💼" },
  { id: 2, name: "Academic", color: "from-green-500 to-blue-500", icon: "🎓" },
  { id: 3, name: "Creative", color: "from-pink-500 to-orange-500", icon: "🎨" },
  { id: 4, name: "Technical", color: "from-gray-600 to-blue-600", icon: "⚙️" },
  { id: 5, name: "Achievement", color: "from-yellow-500 to-red-500", icon: "🏆" },
]

export default function ProofPi() {
  const [user, setUser] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [piSdkReady, setPiSdkReady] = useState(false)
  const [debugLogs, setDebugLogs] = useState<string[]>([])
  const [skill, setSkill] = useState("")
  const [proof, setProof] = useState("")
  const [certificate, setCertificate] = useState<any>(null)
  const [certificates, setCertificates] = useState<any[]>([])
  const [initAttempts, setInitAttempts] = useState(0)
  const [isBrowser, setIsBrowser] = useState(false)
  const [forceLoaded, setForceLoaded] = useState(false)

  // New state for enhanced features
  const [selectedCategory, setSelectedCategory] = useState("")
  const [selectedTemplate, setSelectedTemplate] = useState(certificateTemplates[0])
  const [skillLevel, setSkillLevel] = useState("Intermediate")
  const [expirationDate, setExpirationDate] = useState("")
  const [searchTerm, setSearchTerm] = useState("")
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [filteredSkills, setFilteredSkills] = useState<string[]>([])
  const [activeTab, setActiveTab] = useState("issue") // issue, search, history
  const [searchResults, setSearchResults] = useState<any[]>([])
  const [description, setDescription] = useState("")

  const addLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString()
    const logMessage = `[${timestamp}] ${message}`
    console.log(logMessage)
    setDebugLogs((prev) => [...prev.slice(-15), logMessage]) // Keep last 15 logs
  }

  // Filter skills based on search
  useEffect(() => {
    if (skill.length > 0) {
      const allSkills = Object.values(skillCategories).flat()
      const filtered = allSkills.filter((s) => s.toLowerCase().includes(skill.toLowerCase())).slice(0, 5)
      setFilteredSkills(filtered)
      setShowSuggestions(filtered.length > 0 && skill !== filtered[0])
    } else {
      setShowSuggestions(false)
    }
  }, [skill])

  // Search certificates
  const handleSearch = () => {
    if (!searchTerm.trim()) {
      setSearchResults([])
      return
    }

    const results = certificates.filter(
      (cert) =>
        cert.skill.toLowerCase().includes(searchTerm.toLowerCase()) ||
        cert.user.toLowerCase().includes(searchTerm.toLowerCase()) ||
        cert.description?.toLowerCase().includes(searchTerm.toLowerCase()),
    )
    setSearchResults(results)
    addLog(`🔍 Found ${results.length} certificates matching "${searchTerm}"`)
  }

  // Generate certificate ID
  const generateCertificateId = () => {
    return `CERT-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`
  }

  // Copy certificate link
  const copyCertificateLink = (certId: string) => {
    const link = `${window.location.origin}/certificate/${certId}`
    navigator.clipboard.writeText(link)
    alert("Certificate link copied to clipboard!")
  }

  // Export certificate (mock function)
  const exportCertificate = (cert: any) => {
    addLog(`📄 Exporting certificate for ${cert.user}`)
    alert("Certificate export feature coming soon!")
  }

  // IMPROVED Pi SDK loading - remove MetaMask dependencies
  const forceLoadPiSDK = () => {
    if (!isBrowser) return

    addLog("🔥 FORCE LOADING Pi SDK...")
    setInitAttempts((prev) => prev + 1)

    try {
      // Check if we're in Pi Browser
      const userAgent = navigator.userAgent.toLowerCase()
      const isPiBrowser = userAgent.includes("pi browser") || userAgent.includes("pi-browser")

      if (isPiBrowser) {
        addLog("✅ Pi Browser detected")
      } else {
        addLog("⚠️ Not in Pi Browser - using test mode")
      }

      // Try direct initialization
      if (window.Pi) {
        addLog("✅ Pi SDK found, initializing...")
        try {
          // Try production mode first
          window.Pi.init({ version: "2.0" })
          addLog("✅ Pi SDK initialized in production mode")
          setPiSdkReady(true)
          return
        } catch (e) {
          addLog(`❌ Production mode failed: ${e}`)
          try {
            // Fallback to sandbox mode
            window.Pi.init({ version: "2.0", sandbox: true })
            addLog("✅ Pi SDK initialized in sandbox mode")
            setPiSdkReady(true)
            return
          } catch (e2) {
            addLog(`❌ Sandbox mode failed: ${e2}`)
          }
        }
      } else {
        addLog("❌ Pi SDK not found in window object")
      }

      // If we get here, initialization failed
      if (initAttempts >= 3) {
        addLog("⚠️ Multiple attempts failed, enabling test mode")
        setForceLoaded(true)
        setPiSdkReady(true)
      }
    } catch (error) {
      addLog(`💥 Force load error: ${error}`)
      if (initAttempts >= 3) {
        addLog("⚠️ Multiple attempts failed, enabling test mode")
        setForceLoaded(true)
        setPiSdkReady(true)
      }
    }
  }

  // Load SDK script manually - improved version
  const loadPiSDKScript = () => {
    if (!isBrowser) return

    addLog("📥 Loading Pi SDK script...")

    // Remove any existing script
    const existingScript = document.querySelector('script[src*="pi-sdk.js"]')
    if (existingScript) {
      existingScript.remove()
      addLog("🗑️ Removed existing Pi SDK script")
    }

    // Create new script with better error handling
    const script = document.createElement("script")
    script.src = "https://sdk.minepi.com/pi-sdk.js"
    script.async = true
    script.crossOrigin = "anonymous"

    script.onload = () => {
      addLog("✅ Pi SDK script loaded successfully")
      setTimeout(forceLoadPiSDK, 500)
    }

    script.onerror = (error) => {
      addLog(`❌ Failed to load Pi SDK script: ${error}`)
      setInitAttempts((prev) => prev + 1)

      if (initAttempts >= 2) {
        addLog("⚠️ Script loading failed, enabling test mode")
        setForceLoaded(true)
        setPiSdkReady(true)
      }
    }

    document.head.appendChild(script)
  }

  const resetPiSDK = () => {
    addLog("🔄 Resetting Pi SDK...")
    setPiSdkReady(false)
    setInitAttempts(0)
    setForceLoaded(false)

    // Load SDK script again
    loadPiSDKScript()

    // Also try direct initialization after a delay
    setTimeout(forceLoadPiSDK, 1000)
  }

  const handleLogin = async () => {
    if (!isBrowser) return

    addLog("🔑 Login button clicked")

    // Check if we're in Pi Browser
    const userAgent = navigator.userAgent.toLowerCase()
    const isPiBrowser = userAgent.includes("pi browser") || userAgent.includes("pi-browser")

    // If not in Pi Browser or SDK issues, use mock login
    if (forceLoaded || !window.Pi || !isPiBrowser) {
      addLog("⚠️ Using mock login (not in Pi Browser or SDK issues)")
      handleMockLogin()
      return
    }

    setIsLoading(true)
    addLog("🔄 Starting Pi authentication process...")

    try {
      const scopes = ["username"]
      addLog(`📋 Requesting Pi scopes: ${scopes.join(", ")}`)

      // Shorter timeout for Pi authentication
      const authTimeout = setTimeout(() => {
        addLog("⏰ Pi authentication timeout (8 seconds)")
        setIsLoading(false)
        alert("Pi authentication timed out. Using test mode instead.")
        handleMockLogin()
      }, 8000)

      window.Pi.authenticate(
        scopes,
        (auth) => {
          clearTimeout(authTimeout)
          addLog("🎉 Pi Authentication SUCCESS!")
          addLog(`👤 Pi user data: ${JSON.stringify(auth.user)}`)

          if (!auth.user || !auth.user.username) {
            addLog("❌ Invalid Pi user data")
            alert("Invalid Pi user data. Using test mode instead.")
            handleMockLogin()
            return
          }

          setUser({
            username: auth.user.username,
            uid: auth.user.uid || `pi_${Date.now()}`,
          })
          setIsLoading(false)
          addLog(`✅ Pi user logged in: ${auth.user.username}`)
        },
        (error) => {
          clearTimeout(authTimeout)
          addLog(`💥 Pi Authentication FAILED: ${JSON.stringify(error)}`)
          alert("Pi authentication failed. Using test mode instead.")
          handleMockLogin()
          setIsLoading(false)
        },
      )

      addLog("📞 Pi.authenticate() called, waiting for response...")
    } catch (error) {
      addLog(`💥 Pi authentication exception: ${error}`)
      alert("Pi authentication error. Using test mode instead.")
      handleMockLogin()
      setIsLoading(false)
    }
  }

  const handleIssueCertificate = () => {
    if (!user || !skill || !proof) {
      alert("Please fill in all required fields.")
      return
    }

    const certId = generateCertificateId()
    const cert = {
      id: certId,
      user: user.username,
      skill: skill,
      proof: proof,
      description: description,
      date: new Date().toLocaleString(),
      level: skillLevel,
      template: selectedTemplate,
      expirationDate: expirationDate || null,
    }

    setCertificate(cert)
    setCertificates((prev) => [cert, ...prev])

    // Reset form
    setSkill("")
    setProof("")
    setDescription("")
    setExpirationDate("")

    addLog(`📜 Certificate ${certId} issued for ${user.username}`)
  }

  // Initialize on component mount - improved version
  useEffect(() => {
    setIsBrowser(true)
    addLog("🚀 ProofPi started - Pi Network Certificate Issuer")

    // Check environment
    const userAgent = navigator.userAgent.toLowerCase()
    const isPiBrowser = userAgent.includes("pi browser") || userAgent.includes("pi-browser")

    if (isPiBrowser) {
      addLog("✅ Running in Pi Browser")
    } else {
      addLog("⚠️ Not in Pi Browser - test mode available")
    }

    // Load sample certificates
    const sampleCerts = [
      {
        id: "CERT-SAMPLE-001",
        user: "pi_developer",
        skill: "Smart Contract Development",
        proof: "https://github.com/sample/smart-contracts",
        date: "2024-01-15",
        level: "Advanced",
        template: certificateTemplates[3],
        description: "Completed advanced smart contract development course",
      },
      {
        id: "CERT-SAMPLE-002",
        user: "pi_designer",
        skill: "UI/UX Design",
        proof: "https://portfolio.example.com",
        date: "2024-01-10",
        level: "Intermediate",
        template: certificateTemplates[2],
        description: "Designed user interfaces for mobile applications",
      },
    ]
    setCertificates(sampleCerts)

    // Try to load Pi SDK
    const timer1 = setTimeout(() => {
      loadPiSDKScript()
    }, 1000)

    // Direct initialization attempt
    const timer2 = setTimeout(() => {
      forceLoadPiSDK()
    }, 2000)

    // Final fallback to test mode
    const timer3 = setTimeout(() => {
      if (!piSdkReady) {
        addLog("⚠️ Timeout reached, enabling test mode")
        setForceLoaded(true)
        setPiSdkReady(true)
      }
    }, 6000)

    return () => {
      clearTimeout(timer1)
      clearTimeout(timer2)
      clearTimeout(timer3)
    }
  }, [])

  // Mock login for testing
  const handleMockLogin = () => {
    addLog("🔑 Using MOCK login (for testing only)")
    setUser({
      username: "pi_tester",
      uid: `mock_${Date.now()}`,
    })
  }

  // If not logged in, show login screen
  if (!user) {
    return (
      <div className="min-h-screen bg-[#f4f4f8] p-4">
        <div className="max-w-2xl mx-auto space-y-6">
          {/* Main Login Card */}
          <Card>
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 w-16 h-16 bg-[#6b21a8] rounded-full flex items-center justify-center">
                <Award className="w-8 h-8 text-white" />
              </div>
              <CardTitle className="text-2xl font-bold text-[#6b21a8]">🎓 ProofPi</CardTitle>
              <p className="text-gray-600">Pi Network Certificate Issuer</p>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Status */}
              <div className="text-center">
                {piSdkReady ? (
                  <div className="flex items-center justify-center gap-2 text-green-600">
                    <CheckCircle className="w-5 h-5" />
                    <span>{forceLoaded ? "Test Mode Ready (SDK Bypassed)" : "Pi SDK Ready"}</span>
                  </div>
                ) : (
                  <div className="flex items-center justify-center gap-2 text-orange-600">
                    <div className="w-5 h-5 border-2 border-orange-600 border-t-transparent rounded-full animate-spin"></div>
                    <span>Loading Pi SDK... (Attempt {initAttempts}/3)</span>
                  </div>
                )}
              </div>

              {/* Login Button */}
              <Button
                onClick={handleLogin}
                disabled={isLoading || !piSdkReady}
                className="w-full bg-[#7b2cbf] hover:bg-[#5a189a] text-white font-bold py-3 text-lg"
              >
                {isLoading ? "🔄 Connecting to Pi Wallet..." : "🔐 Connect Pi Wallet"}
              </Button>

              {/* Reset Button */}
              <Button onClick={resetPiSDK} variant="outline" className="w-full" disabled={isLoading}>
                <RefreshCw className="w-4 h-4 mr-2" />
                Reset Pi SDK
              </Button>

              {/* Mock Login (for testing) */}
              <Button
                onClick={handleMockLogin}
                variant="outline"
                className="w-full border-dashed border-gray-300"
                disabled={isLoading}
              >
                🧪 Test Mode (Skip Pi Wallet)
              </Button>

              <p className="text-center text-gray-600 text-sm">You are not logged in</p>

              {/* Enhanced Instructions */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm">
                <h3 className="font-semibold text-blue-800 mb-2">🔧 Troubleshooting:</h3>
                <ol className="list-decimal list-inside space-y-1 text-blue-700">
                  <li>
                    <strong>Click "Reset Pi SDK"</strong> to force reload
                  </li>
                  <li>
                    <strong>Use "Test Mode"</strong> to bypass Pi Wallet completely
                  </li>
                  <li>
                    <strong>Wait 5 seconds</strong> - app will auto-switch to test mode
                  </li>
                </ol>
              </div>
            </CardContent>
          </Card>

          {/* Debug Logs */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <AlertCircle className="w-5 h-5" />
                Debug Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="bg-gray-900 text-green-400 p-4 rounded-lg font-mono text-sm max-h-60 overflow-y-auto">
                {debugLogs.length > 0 ? (
                  debugLogs.map((log, index) => (
                    <div key={index} className="mb-1">
                      {log}
                    </div>
                  ))
                ) : (
                  <div>No logs yet...</div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  // If logged in, show the main app
  return (
    <div className="min-h-screen bg-[#f4f4f8] p-2 sm:p-4">
      <div className="max-w-4xl mx-auto space-y-4">
        {/* Header */}
        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold text-[#6b21a8]">🎓 ProofPi</CardTitle>
            <p className="text-gray-600">
              👤 Logged in as: <span className="font-semibold text-[#6b21a8]">{user.username}</span>
            </p>
          </CardHeader>
        </Card>

        {/* Navigation Tabs */}
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          <div className="grid grid-cols-3 divide-x divide-gray-200">
            <button
              onClick={() => setActiveTab("issue")}
              className={`flex flex-col items-center justify-center py-4 transition-all ${
                activeTab === "issue" ? "bg-purple-50 text-purple-800" : "bg-white text-gray-600 hover:bg-gray-50"
              }`}
            >
              <Award className={`w-6 h-6 mb-1 ${activeTab === "issue" ? "text-purple-700" : "text-gray-500"}`} />
              <span className="text-sm font-medium">Issue</span>
            </button>
            <button
              onClick={() => setActiveTab("search")}
              className={`flex flex-col items-center justify-center py-4 transition-all ${
                activeTab === "search" ? "bg-purple-50 text-purple-800" : "bg-white text-gray-600 hover:bg-gray-50"
              }`}
            >
              <Search className={`w-6 h-6 mb-1 ${activeTab === "search" ? "text-purple-700" : "text-gray-500"}`} />
              <span className="text-sm font-medium">Search</span>
            </button>
            <button
              onClick={() => setActiveTab("history")}
              className={`flex flex-col items-center justify-center py-4 transition-all ${
                activeTab === "history" ? "bg-purple-50 text-purple-800" : "bg-white text-gray-600 hover:bg-gray-50"
              }`}
            >
              <History className={`w-6 h-6 mb-1 ${activeTab === "history" ? "text-purple-700" : "text-gray-500"}`} />
              <span className="text-sm font-medium">My Certs</span>
            </button>
          </div>
        </div>

        {/* Issue Certificate Tab */}
        {activeTab === "issue" && (
          <Card className="bg-gradient-to-br from-purple-50 to-blue-50 border-purple-200">
            <CardHeader>
              <CardTitle className="text-xl font-bold text-center text-[#6b21a8] flex items-center justify-center gap-2">
                <Award className="w-6 h-6" />
                Issue New Certificate
              </CardTitle>
              <p className="text-center text-gray-600">Create a verified skill certificate</p>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Certificate Template Selection */}
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700">🎨 Certificate Template</label>
                <div className="grid grid-cols-3 gap-2 sm:grid-cols-5">
                  {certificateTemplates.map((template) => (
                    <button
                      key={template.id}
                      onClick={() => setSelectedTemplate(template)}
                      className={`h-20 flex flex-col items-center justify-center rounded-lg border-2 transition-all ${
                        selectedTemplate.id === template.id
                          ? "border-purple-500 bg-purple-50"
                          : "border-gray-200 hover:border-purple-200"
                      }`}
                    >
                      <span className="text-2xl mb-1">{template.icon}</span>
                      <span className="text-xs">{template.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Skill Category Selection */}
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700">📚 Skill Category</label>
                <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                  {Object.keys(skillCategories).map((category) => (
                    <button
                      key={category}
                      onClick={() => setSelectedCategory(category)}
                      className={`py-3 px-4 rounded-lg flex items-center justify-between transition-all ${
                        selectedCategory === category
                          ? "bg-purple-100 text-purple-800 font-medium"
                          : "bg-white border border-gray-200 text-gray-700 hover:bg-gray-50"
                      }`}
                    >
                      <span>{category}</span>
                      {selectedCategory === category && <CheckCircle className="w-5 h-5 text-purple-600" />}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Skill Input with Suggestions */}
                <div className="space-y-2 relative">
                  <label className="block text-sm font-semibold text-gray-700">🎯 Skill or Achievement</label>
                  <Input
                    value={skill}
                    onChange={(e) => setSkill(e.target.value)}
                    placeholder="e.g., Smart Contract Development"
                    className="w-full p-4 text-base border-2 border-purple-200 focus:border-purple-500 rounded-lg"
                  />

                  {/* Skill Suggestions */}
                  {showSuggestions && (
                    <div className="absolute z-10 w-full bg-white border border-gray-200 rounded-lg shadow-lg mt-1">
                      {filteredSkills.map((suggestion, index) => (
                        <button
                          key={index}
                          onClick={() => {
                            setSkill(suggestion)
                            setShowSuggestions(false)
                          }}
                          className="w-full text-left px-4 py-2 hover:bg-gray-100 first:rounded-t-lg last:rounded-b-lg"
                        >
                          {suggestion}
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Quick Skill Buttons */}
                  {selectedCategory && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {skillCategories[selectedCategory].slice(0, 3).map((quickSkill) => (
                        <Button
                          key={quickSkill}
                          onClick={() => setSkill(quickSkill)}
                          variant="outline"
                          size="sm"
                          className="text-xs"
                        >
                          {quickSkill}
                        </Button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Skill Level */}
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700">⭐ Skill Level</label>
                  <div className="grid grid-cols-3 gap-2">
                    {["Beginner", "Intermediate", "Advanced"].map((level) => (
                      <Button
                        key={level}
                        onClick={() => setSkillLevel(level)}
                        variant={skillLevel === level ? "default" : "outline"}
                        size="sm"
                      >
                        {level}
                      </Button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Description */}
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700">📝 Description (Optional)</label>
                <Input
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Brief description of the achievement or skill"
                  className="w-full p-4 text-base border-2 border-purple-200 focus:border-purple-500 rounded-lg"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Proof URL */}
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700">🔗 Proof of Achievement</label>
                  <Input
                    value={proof}
                    onChange={(e) => setProof(e.target.value)}
                    placeholder="https://github.com/yourproject"
                    className="w-full p-4 text-base border-2 border-purple-200 focus:border-purple-500 rounded-lg"
                  />
                </div>

                {/* Expiration Date */}
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700">📅 Expiration Date (Optional)</label>
                  <Input
                    type="date"
                    value={expirationDate}
                    onChange={(e) => setExpirationDate(e.target.value)}
                    className="w-full p-4 text-base border-2 border-purple-200 focus:border-purple-500 rounded-lg"
                  />
                </div>
              </div>

              {/* Certificate Preview */}
              <div className={`bg-gradient-to-r ${selectedTemplate.color} rounded-lg p-6 text-white`}>
                <h4 className="font-bold text-lg mb-4 text-center">📋 Certificate Preview</h4>
                <div className="bg-white/20 rounded-lg p-4 space-y-2">
                  <p>
                    <strong>Template:</strong> {selectedTemplate.icon} {selectedTemplate.name}
                  </p>
                  <p>
                    <strong>Recipient:</strong> {user.username}
                  </p>
                  <p>
                    <strong>Skill:</strong> {skill || "Enter skill above"}
                  </p>
                  <p>
                    <strong>Level:</strong> {skillLevel}
                  </p>
                  <p>
                    <strong>Description:</strong> {description || "No description"}
                  </p>
                  <p>
                    <strong>Proof:</strong> {proof || "Enter proof URL above"}
                  </p>
                  <p>
                    <strong>Date:</strong> {new Date().toLocaleDateString()}
                  </p>
                  {expirationDate && (
                    <p>
                      <strong>Expires:</strong> {new Date(expirationDate).toLocaleDateString()}
                    </p>
                  )}
                </div>
              </div>

              <Button
                onClick={handleIssueCertificate}
                disabled={!skill || !proof}
                className="w-full bg-gradient-to-r from-[#7b2cbf] to-[#9d4edd] hover:from-[#5a189a] hover:to-[#7b2cbf] text-white font-bold py-4 text-lg rounded-lg shadow-lg transform transition-all duration-200 hover:scale-105 disabled:opacity-50 disabled:transform-none"
              >
                {!skill || !proof ? (
                  <>🔒 Fill in required fields to issue certificate</>
                ) : (
                  <>🎓 Issue Certificate on Pi Network</>
                )}
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Search Tab */}
        {activeTab === "search" && (
          <Card>
            <CardHeader>
              <CardTitle className="text-xl font-bold text-[#6b21a8] flex items-center gap-2">
                <Search className="w-6 h-6" />
                Search & Verify Certificates
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Search Input - Mobile Friendly */}
              <div className="flex flex-col gap-2 sm:flex-row">
                <Input
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search by skill, username, or description..."
                  className="flex-1 h-12 text-base"
                  onKeyPress={(e) => e.key === "Enter" && handleSearch()}
                />
                <Button onClick={handleSearch} className="bg-[#7b2cbf] hover:bg-[#5a189a] h-12 text-base">
                  <Search className="w-5 h-5 mr-2" />
                  Search
                </Button>
              </div>

              {/* Search Results */}
              <div className="space-y-4">
                {searchResults.length > 0 ? (
                  searchResults.map((cert) => (
                    <Card key={cert.id} className="border-l-4 border-l-purple-500">
                      <CardContent className="pt-4">
                        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start">
                          <div className="space-y-2">
                            <h3 className="font-bold text-lg">{cert.skill}</h3>
                            <p className="text-gray-600 flex items-center gap-1">
                              <span className="text-lg">👤</span> {cert.user}
                            </p>
                            <p className="text-gray-600 flex items-center gap-1">
                              <span className="text-lg">📅</span> {cert.date}
                            </p>
                            <p className="text-gray-600 flex items-center gap-1">
                              <span className="text-lg">⭐</span> {cert.level}
                            </p>
                            {cert.description && (
                              <p className="text-gray-600 flex items-center gap-1">
                                <span className="text-lg">📝</span> {cert.description}
                              </p>
                            )}
                          </div>
                          <div className="flex gap-2 mt-4 sm:mt-0">
                            <Button
                              onClick={() => copyCertificateLink(cert.id)}
                              size="lg"
                              variant="outline"
                              className="flex-1 sm:flex-none"
                            >
                              <Copy className="w-5 h-5 sm:mr-2" />
                              <span className="hidden sm:inline">Copy</span>
                            </Button>
                            <Button
                              onClick={() => exportCertificate(cert)}
                              size="lg"
                              variant="outline"
                              className="flex-1 sm:flex-none"
                            >
                              <Download className="w-5 h-5 sm:mr-2" />
                              <span className="hidden sm:inline">Export</span>
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                ) : searchTerm ? (
                  <p className="text-center text-gray-500 py-8">No certificates found matching "{searchTerm}"</p>
                ) : (
                  <p className="text-center text-gray-500 py-8">Enter a search term to find certificates</p>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* History Tab */}
        {activeTab === "history" && (
          <Card>
            <CardHeader>
              <CardTitle className="text-xl font-bold text-[#6b21a8] flex items-center gap-2">
                <History className="w-6 h-6" />
                My Certificates ({certificates.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {certificates.length > 0 ? (
                certificates.map((cert) => (
                  <Card
                    key={cert.id}
                    className={`border-l-4 bg-gradient-to-r ${cert.template?.color || "border-l-purple-500"} bg-opacity-10 overflow-hidden`}
                  >
                    <CardContent className="pt-4">
                      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start">
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <span className="text-2xl">{cert.template?.icon || "🎓"}</span>
                            <h3 className="font-bold text-lg">{cert.skill}</h3>
                          </div>
                          <p className="text-gray-600 flex items-center gap-1">
                            <span className="text-lg">👤</span> {cert.user}
                          </p>
                          <p className="text-gray-600 flex items-center gap-1">
                            <span className="text-lg">📅</span> {cert.date}
                          </p>
                          <p className="text-gray-600 flex items-center gap-1">
                            <span className="text-lg">⭐</span> {cert.level}
                          </p>
                          <p className="text-gray-600 flex items-center gap-1 break-all">
                            <span className="text-lg">🆔</span> {cert.id}
                          </p>
                          {cert.description && (
                            <p className="text-gray-600 flex items-center gap-1">
                              <span className="text-lg">📝</span> {cert.description}
                            </p>
                          )}
                          <a
                            href={cert.proof}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:underline inline-flex items-center gap-1"
                          >
                            <span className="text-lg">🔗</span> View Proof <Eye className="w-5 h-5" />
                          </a>
                        </div>
                        <div className="flex gap-2 mt-4 sm:mt-0">
                          <Button
                            onClick={() => copyCertificateLink(cert.id)}
                            size="lg"
                            variant="outline"
                            className="flex-1 sm:flex-none"
                          >
                            <Share2 className="w-5 h-5 sm:mr-2" />
                            <span className="hidden sm:inline">Share</span>
                          </Button>
                          <Button
                            onClick={() => exportCertificate(cert)}
                            size="lg"
                            variant="outline"
                            className="flex-1 sm:flex-none"
                          >
                            <Download className="w-5 h-5 sm:mr-2" />
                            <span className="hidden sm:inline">Export</span>
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              ) : (
                <p className="text-center text-gray-500 py-8">No certificates issued yet</p>
              )}
            </CardContent>
          </Card>
        )}

        {/* Latest Certificate Result */}
        {certificate && activeTab === "issue" && (
          <Card className="bg-green-50 border-green-200">
            <CardContent className="pt-6">
              <h3 className="text-xl font-bold text-green-800 mb-4 flex items-center gap-2">
                <CheckCircle className="w-6 h-6" />
                Certificate Successfully Issued!
              </h3>
              <div className="space-y-2">
                <p>
                  <strong>Certificate ID:</strong> {certificate.id}
                </p>
                <p>
                  <strong>User:</strong> {certificate.user}
                </p>
                <p>
                  <strong>Skill:</strong> {certificate.skill}
                </p>
                <p>
                  <strong>Level:</strong> {certificate.level}
                </p>
                <p>
                  <strong>Template:</strong> {certificate.template.icon} {certificate.template.name}
                </p>
                {certificate.description && (
                  <p>
                    <strong>Description:</strong> {certificate.description}
                  </p>
                )}
                <p>
                  <strong>Date:</strong> {certificate.date}
                </p>
                {certificate.expirationDate && (
                  <p>
                    <strong>Expires:</strong> {new Date(certificate.expirationDate).toLocaleDateString()}
                  </p>
                )}
              </div>
              <div className="flex gap-2 mt-4">
                <Button onClick={() => copyCertificateLink(certificate.id)} variant="outline" className="flex-1">
                  <Copy className="w-4 h-4 mr-2" />
                  Copy Link
                </Button>
                <Button onClick={() => exportCertificate(certificate)} variant="outline" className="flex-1">
                  <Download className="w-4 h-4 mr-2" />
                  Export
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
