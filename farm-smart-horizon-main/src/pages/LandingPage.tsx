import React from 'react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

const FeatureCard = ({ icon, titleEn, titleHi, descriptionEn, descriptionHi }: {
  icon: string;
  titleEn: string;
  titleHi: string;
  descriptionEn: string;
  descriptionHi: string;
}) => (
  <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
    <div className="text-4xl mb-4">{icon}</div>
    <h3 className="text-xl font-bold mb-2">{titleEn}</h3>
    <h4 className="text-sm text-gray-500 mb-3">{titleHi}</h4>
    <p className="text-gray-700 mb-2">{descriptionEn}</p>
    <p className="text-sm text-gray-600">{descriptionHi}</p>
  </div>
);

const TestimonialCard = ({ name, crop, quoteEn, quoteHi, impact }: {
  name: string;
  crop: string;
  quoteEn: string;
  quoteHi: string;
  impact: string;
}) => (
  <div className="bg-white p-6 rounded-lg shadow-md">
    <div className="flex items-center mb-4">
      <div className="bg-gray-200 rounded-full w-12 h-12 flex items-center justify-center text-2xl">
        👨‍🌾
      </div>
      <div className="ml-4">
        <h4 className="font-semibold">{name}</h4>
        <p className="text-sm text-gray-600">{crop}</p>
      </div>
    </div>
    <p className="italic mb-4">"{quoteEn}"</p>
    <p className="text-sm text-gray-600 mb-2">"{quoteHi}"</p>
    <div className="text-sm font-medium text-green-600">{impact}</div>
  </div>
);

const LandingPage = () => {
  const navigate = useNavigate();
  const [currentSlide, setCurrentSlide] = React.useState(0);
  
  const backgroundImages = [
    '/images/1.jpg',
    '/images/2.jpg',
    '/images/3.jpg',
    '/images/4.jpg'
  ];

  React.useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % backgroundImages.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [backgroundImages.length]);

  const features = [
    {
      icon: "📸",
      titleEn: "Snap & Detect",
      titleHi: "फोटो लें और पहचानें",
      descriptionEn: "Simply take a photo of your crop leaves and get instant AI-powered disease identification with 95%+ accuracy.",
      descriptionHi: "बस अपनी फसल की पत्तियों की फोटो लें और 95% से अधिक सटीकता के साथ तुरंत बीमारी की पहचान करें।"
    },
    {
      icon: "👨‍🌾",
      titleEn: "Smart Solutions",
      titleHi: "स्मार्ट समाधान",
      descriptionEn: "Receive personalized treatment recommendations, organic solutions, and preventive measures from agricultural experts.",
      descriptionHi: "कृषि विशेषज्ञों से व्यक्तिगत उपचार सुझाव, जैविक समाधान और रोकथाम के तरीके प्राप्त करें।"
    },
    {
      icon: "🗣️",
      titleEn: "Your Language",
      titleHi: "आपकी भाषा",
      descriptionEn: "Access the platform in Hindi, English, Telugu, Tamil, and Marathi - making technology accessible for all farmers.",
      descriptionHi: "हिंदी, अंग्रेजी, तेलुगु, तमिल और मराठी में प्लेटफॉर्म का उपयोग करें - सभी किसानों के लिए तकनीक सुलभ।"
    }
  ];

  const testimonials = [
    {
      name: "राम प्रसाद शर्मा, उत्तर प्रदेश",
      crop: "गेहूं और धान",
      quoteHi: "FarmLive की मदद से मैंने अपनी गेहूं की फसल में रतुआ रोग की शुरुआती पहचान की। समय पर इलाज से 80% फसल बच गई!",
      quoteEn: "With FarmLive's help, I identified rust disease in my wheat crop early. Timely treatment saved 80% of my harvest!",
      impact: "Saved ₹2.5 lakhs in potential crop loss"
    },
    {
      name: "सुनीता देवी, राजस्थान",
      crop: "कपास",
      quoteHi: "मोबाइल ऐप बहुत आसान है। फोटो लेते ही बीमारी पता चल जाती है। अब डॉक्टर के पास दौड़ना नहीं पड़ता।",
      quoteEn: "The mobile app is very easy to use. Disease is detected as soon as I take a photo. No need to run to experts anymore.",
      impact: "Increased yield by 35% this season"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white">
      {/* Hero Section */}
      <header className="relative overflow-hidden text-white py-24 md:py-32">
        {/* Background Slideshow */}
        <div className="absolute inset-0 overflow-hidden">
          {backgroundImages.map((image, index) => (
            <div 
              key={index}
              className={`absolute inset-0 bg-cover bg-center transition-opacity duration-1000 ${index === currentSlide ? 'opacity-100' : 'opacity-0'}`}
              style={{
                backgroundImage: `url(${image})`,
                transition: 'opacity 1.5s ease-in-out',
              }}
            />
          ))}
          {/* Enhanced green gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-br from-green-800/70 via-emerald-800/60 to-teal-800/50"></div>
          {/* Subtle dark overlay for better text contrast */}
          <div className="absolute inset-0 bg-black/20"></div>
          {/* Decorative elements */}
          <div className="absolute -top-10 -right-10 w-72 h-72 bg-green-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
          <div className="absolute -bottom-24 -left-20 w-96 h-96 bg-emerald-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-teal-400 rounded-full mix-blend-multiply filter blur-xl opacity-10 animate-blob animation-delay-4000"></div>
        </div>
        
        <div className="relative z-10 container mx-auto px-4 text-center">
          <div className="inline-block mb-6 px-4 py-2 bg-green-800/60 backdrop-blur-sm rounded-full text-sm font-bold text-white border border-green-300/30">
            Empowering Farmers, Nourishing India
          </div>
          
          <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
            <span className="block mb-3 text-green-50 drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)]">FarmLive Innovations</span>
            <span className="text-3xl md:text-5xl font-semibold text-white bg-gradient-to-r from-green-500 to-emerald-400 bg-clip-text text-transparent drop-shadow-[0_2px_4px_rgba(0,0,0,0.3)]">
              AI-Powered Crop Disease Detection
            </span>
          </h1>
          
          <h2 className="text-xl md:text-2xl mb-8 text-white/90 italic drop-shadow-[0_2px_4px_rgba(0,0,0,0.3)]">
            कृत्रिम बुद्धिमत्ता से भारतीय किसानों को सशक्त बनाना
          </h2>
          
          <p className="text-lg md:text-xl mb-10 max-w-3xl mx-auto leading-relaxed text-white/90 drop-shadow-[0_1px_2px_rgba(0,0,0,0.3)]">
            Detect crop diseases instantly, get expert treatment recommendations, and protect your harvest with cutting-edge technology designed for small and marginal farmers.
          </p>
          
          <div className="flex flex-wrap justify-center gap-8 mt-12 mb-8">
            {[
              { value: '95%+', label: 'Accuracy' },
              { value: '50+', label: 'Diseases' },
              { value: '10,000+', label: 'Farmers' },
              { value: '24/7', label: 'Support' }
            ].map((stat, index) => (
              <div 
                key={index}
                className="group bg-white/10 backdrop-blur-sm p-4 rounded-xl border border-white/20 hover:bg-white/20 transition-all duration-300 transform hover:-translate-y-1"
              >
                <div className="text-3xl md:text-4xl font-bold mb-1 text-white group-hover:text-white transition-colors drop-shadow-[0_2px_4px_rgba(0,0,0,0.3)]">
                  {stat.value}
                </div>
                <div className="text-sm font-medium text-white/90 drop-shadow-[0_1px_2px_rgba(0,0,0,0.3)]">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
          
          <div className="mt-12 space-y-4 sm:space-y-0 sm:space-x-6">
            <Button 
              className="bg-white text-green-700 hover:bg-green-50 font-bold py-4 px-8 rounded-full text-lg shadow-lg hover:shadow-xl transform transition-all duration-300 hover:-translate-y-0.5"
              onClick={() => navigate('/app')}
            >
              <span className="flex items-center">
                <span className="mr-2">🚀</span>
                Get Started - मुफ्त में शुरू करें
              </span>
            </Button>
            <Button 
              variant="outline"
              className="border-2 border-white bg-white/5 text-white hover:bg-white/20 font-bold py-4 px-8 rounded-full text-lg ml-4 transition-all duration-300 hover:-translate-y-0.5 backdrop-blur-sm"
            >
              <span className="flex items-center">
                <span className="mr-2">▶️</span>
                <a href="https://drive.google.com/file/d/1nPUy1_SOfW8pX_G8lnQmX38pzlCUf7tT/view?usp=drive_link" target="_blank" rel="noopener noreferrer">Watch Demo</a>
              </span>
            </Button>
          </div>
          
          <div className="mt-16 flex justify-center space-x-6">
            <button className="w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors">
              <span className="text-xl">🌾</span>
            </button>
            <button className="w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors">
              <span className="text-xl">🌱</span>
            </button>
            <button className="w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors">
              <span className="text-xl">🌽</span>
            </button>
          </div>
        </div>
      </header>

      {/* Features Section */}
      <section className="py-20 bg-white relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KICA8cmVjdCB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIGZpbGw9IiNmOGY5ZmEiLz4KICA8cGF0aCBkPSJNMzAgMTVjLTguMjg0IDAtMTUgNi43MTYtMTUgMTVzNi43MTYgMTUgMTUgMTVjOC4yODQgMCAxNS02LjcxNiAxNS0xNXM2LjcxNi0xNSAxNS0xNWgtMTV6IiBmaWxsPSIjZTZmMGYxIi8+Cjwvc3ZnPg==')] opacity-10"></div>
        <div className="relative z-10 container mx-auto px-4">
          <div className="text-center mb-16">
            <span className="inline-block mb-3 text-sm font-semibold text-green-600 bg-green-100 px-4 py-1 rounded-full">
              Why Choose Us
            </span>
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Empowering Farmers with <span className="text-green-600">Smart Solutions</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Our platform combines cutting-edge AI technology with agricultural expertise to provide comprehensive solutions for modern farming challenges.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div 
                key={index}
                className="group bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100 hover:border-green-100 transform hover:-translate-y-1"
              >
                <div className="p-2">
                  <div className="bg-gradient-to-br from-green-100 to-emerald-100 w-16 h-16 rounded-xl flex items-center justify-center text-3xl mb-6 mx-auto group-hover:scale-110 transition-transform duration-300">
                    {feature.icon}
                  </div>
                  <h3 className="text-xl font-bold text-center text-gray-900 mb-2">
                    {feature.titleEn}
                  </h3>
                  <h4 className="text-sm text-center text-gray-500 mb-4">
                    {feature.titleHi}
                  </h4>
                  <p className="text-gray-600 text-center px-4 pb-6">
                    {feature.descriptionEn}
                  </p>
                </div>
                <div className="bg-gray-50 px-6 py-4 border-t border-gray-100">
                  <p className="text-sm text-gray-500 text-center">
                    {feature.descriptionHi}
                  </p>
                </div>
              </div>
            ))}
          </div>
          
          <div className="mt-16 text-center">
            <Button 
              variant="outline" 
              className="border-2 border-green-600 text-green-700 hover:bg-green-50 font-semibold py-3 px-8 rounded-full transition-all duration-300 hover:shadow-md"
            >
              Explore All Features →
            </Button>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="relative py-20 bg-gradient-to-b from-white to-gray-50 overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute top-0 left-0 w-full h-full">
          <div className="absolute -right-20 -top-20 w-64 h-64 bg-green-100 rounded-full opacity-20"></div>
          <div className="absolute -left-20 -bottom-20 w-96 h-96 bg-emerald-100 rounded-full opacity-20"></div>
        </div>
        
        <div className="relative z-10 container mx-auto px-4">
          <div className="text-center mb-16">
            <span className="inline-block mb-3 text-sm font-semibold text-green-600 bg-green-50 px-4 py-1 rounded-full">
              Farmer Testimonials
            </span>
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Success <span className="text-green-600">Stories</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Hear from farmers who have transformed their agricultural practices with our platform
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-8">
            {testimonials.map((testimonial, index) => (
              <div 
                key={index}
                className="bg-white rounded-xl shadow-lg overflow-hidden transform transition-all duration-500 hover:shadow-xl hover:-translate-y-2"
              >
                <div className="p-8">
                  <div className="flex items-center mb-6">
                    <div className="bg-gradient-to-br from-green-100 to-emerald-100 w-16 h-16 rounded-full flex items-center justify-center text-2xl text-green-600 font-bold">
                      {testimonial.name.charAt(0)}
                    </div>
                    <div className="ml-4">
                      <h4 className="font-bold text-lg text-gray-900">{testimonial.name.split(',')[0]}</h4>
                      <p className="text-sm text-gray-500">{testimonial.crop} • {testimonial.name.split(',')[1]}</p>
                    </div>
                  </div>
                  <p className="text-gray-700 italic mb-4 border-l-4 border-green-200 pl-4 py-1">
                    "{testimonial.quoteEn}"
                  </p>
                  <p className="text-sm text-gray-500 mb-4">
                    "{testimonial.quoteHi}"
                  </p>
                  <div className="flex items-center text-sm text-green-600 font-medium">
                    <svg className="w-5 h-5 mr-1" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    {testimonial.impact}
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          <div className="mt-12 text-center">
            <Button 
              variant="outline"
              className="border-2 border-green-600 text-green-700 hover:bg-green-50 font-semibold py-3 px-8 rounded-full transition-all duration-300 hover:shadow-md"
            >
              Read More Success Stories →
            </Button>
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="relative py-20 bg-gradient-to-r from-green-600 to-emerald-700 text-white overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute inset-0">
          <div className="absolute top-0 right-0 w-1/3 h-full bg-gradient-to-l from-green-700/20 to-transparent"></div>
          <div className="absolute bottom-0 left-0 w-1/2 h-1/2 bg-gradient-to-tr from-emerald-500/10 to-transparent rounded-full"></div>
        </div>
        
        <div className="relative z-10 container mx-auto px-4 text-center">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-4xl md:text-5xl font-bold mb-6 leading-tight">
              Ready to Transform Your Farming Experience?
            </h2>
          </div>
          <div className="container mx-auto px-4">
          <div className="flex justify-center w-full mb-12">
            <div className="text-center">
              <div className="flex flex-col items-center mb-6">
                <div className="flex items-center">
                  <h2 className="text-2xl font-bold text-white">FarmLive</h2>
                  <span className="ml-2 text-xs bg-green-600 text-white px-2 py-1 rounded-full">BETA</span>
                </div>
                <p className="text-gray-400 max-w-md mt-4 mb-6">
                  Empowering farmers with AI-powered crop disease detection and agricultural solutions for sustainable farming.
                </p>
                <div className="flex justify-center space-x-6">
                  {[
                    { name: 'Facebook', icon: 'M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.797v8.385C19.612 23.027 24 18.062 24 12.073z' },
                    { name: 'Twitter', icon: 'M23.953 4.57a10 10.057 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.922 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z' },
                    { name: 'YouTube', icon: 'M23.5 6.507a2.5 2.5 0 00-1.768-2.407C19.8 3.6 12 3.6 12 3.6s-7.8 0-9.732.5A2.5 2.5 0 00.5 6.507 27.4 27.4 0 000 12.1a27.4 27.4 0 00.5 5.593 2.5 2.5 0 001.768 2.407C4.2 20.6 12 20.6 12 20.6s7.8 0 9.732-.5a2.5 2.5 0 001.768-2.407 27.4 27.4 0 00.5-5.593 27.4 27.4 0 00-.5-5.593zM9.6 15.425V8.775l6.5 3.325-6.5 3.325z' },
                    { name: 'LinkedIn', icon: 'M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z' }
                  ].map((social) => (
                    <a
                      key={social.name}
                      href="#"
                      className="text-gray-400 hover:text-white transition-colors duration-300"
                      aria-label={social.name}
                    >
                      <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                        <path d={social.icon} />
                      </svg>
                    </a>
                  ))}
                </div>
              </div>
            </div>
          </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full">
              <div>
                <h4 className="text-sm font-semibold text-gray-100 uppercase tracking-wider mb-4">
                  Solutions
                </h4>
                <ul className="space-y-3">
                  {[
                    { name: 'Crop Monitoring', href: '#' },
                    { name: 'Disease Detection', href: '#' },
                    { name: 'Weather Advisory', href: '#' },
                    { name: 'Market Intelligence', href: '#' },
                    { name: 'Precision Farming', href: '#' }
                  ].map((item) => (
                    <li key={item.name}>
                      <a 
                        href={item.href} 
                        className="text-gray-400 hover:text-white transition-colors duration-300 text-sm"
                      >
                        {item.name}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
              
              <div>
                <h4 className="text-sm font-semibold text-gray-100 uppercase tracking-wider mb-4">Support</h4>
                <ul className="space-y-3">
                  {[
                    { name: 'Documentation', href: '#' },
                    { name: 'Guides', href: '#' },
                    { name: 'API Status', href: '#' },
                    { name: 'Help Center', href: '#' },
                    { name: 'Contact Us', href: '#' }
                  ].map((item) => (
                    <li key={item.name}>
                      <a 
                        href={item.href} 
                        className="text-gray-400 hover:text-white transition-colors duration-300 text-sm"
                      >
                        {item.name}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
            
            <div className="col-span-2 md:col-span-1">
              <h4 className="text-sm font-semibold text-gray-100 uppercase tracking-wider mb-4">
                Download App
              </h4>
              <div className="space-y-3">
                <a 
                  href="#" 
                  className="block bg-gray-800 hover:bg-gray-700 rounded-lg p-3 transition-colors duration-300"
                >
                  <div className="flex items-center">
                    <svg 
                      className="w-8 h-8 mr-3" 
                      viewBox="0 0 24 24" 
                      fill="currentColor"
                    >
                      <path d="M3.609 1.814L13.792 12 3.61 22.186a1.75 1.75 0 0 1-.61-1.32V3.134a1.75 1.75 0 0 1 .609-1.32zm.921 19.08L12 13.155l7.47 7.74a1.75 1.75 0 0 1-1.242.513H5.71a1.75 1.75 0 0 1-1.18-.464zM12 10.845L4.53 3.106a1.75 1.75 0 0 1 1.18-.464h12.518a1.75 1.75 0 0 1 1.242.512L12 10.845z"/>
                    </svg>
                    <div className="text-left">
                      <div className="text-xs text-gray-400">Download on the</div>
                      <div className="text-white font-medium">App Store</div>
                    </div>
                  </div>
                </a>
                <a href="#" className="block bg-gray-800 hover:bg-gray-700 rounded-lg p-3 transition-colors duration-300">
                  <div className="flex items-center">
                    <svg className="w-8 h-8 mr-3" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M3.609 1.814L13.792 12 3.61 22.186a1.75 1.75 0 0 1-.61-1.32V3.134a1.75 1.75 0 0 1 .609-1.32zm.921 19.08L12 13.155l7.47 7.74a1.75 1.75 0 0 1-1.242.513H5.71a1.75 1.75 0 0 1-1.18-.464zM12 10.845L4.53 3.106a1.75 1.75 0 0 1 1.18-.464h12.518a1.75 1.75 0 0 1 1.242.512L12 10.845z"/>
                    </svg>
                    <div className="text-left">
                      <div className="text-xs text-gray-400">Get it on</div>
                      <div className="text-white font-medium">Google Play</div>
                    </div>
                  </div>
                </a>
              </div>
            </div>
          </div>
        

                

            </div>
            </section>
          </div>
       
  );
};

export default LandingPage;
