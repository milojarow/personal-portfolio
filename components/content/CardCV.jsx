"use client";

import { useState, useEffect } from 'react';
import { 
  Briefcase, Award, Book, Calendar, MapPin, Mail, Phone, 
  Languages, User, CheckCircle, FileText, Wrench, 
  ChevronRight, Clock, Globe, Grid, List, 
  Eye, ExternalLink, Download, Printer, Share2
} from 'lucide-react';

// Import content files
import { contentEng } from './cv/content-eng';
import { contentEsp } from './cv/content-esp';

// Typewriter Animation Component
function TypewriterText({ currentLanguage }) {
  const words = currentLanguage === 'eng' ? ['Language', 'Idioma'] : ['Idioma', 'Language'];
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [currentText, setCurrentText] = useState('');
  const [isTyping, setIsTyping] = useState(true);
  const [charIndex, setCharIndex] = useState(0);
  const [showCursor, setShowCursor] = useState(true);
  const [isWaiting, setIsWaiting] = useState(false);

  useEffect(() => {
    if (isWaiting) return; // Don't do anything while waiting
    
    const currentWord = words[currentWordIndex];
    
    const timer = setTimeout(() => {
      if (isTyping) {
        // Typing animation
        if (charIndex < currentWord.length) {
          setCurrentText(currentWord.slice(0, charIndex + 1));
          setCharIndex(prev => prev + 1);
        } else {
          // Word is complete, wait then start deleting
          setIsWaiting(true);
          setTimeout(() => {
            setIsWaiting(false);
            setIsTyping(false);
          }, 2000);
        }
      } else {
        // Deleting animation
        if (charIndex > 0) {
          setCurrentText(currentWord.slice(0, charIndex - 1));
          setCharIndex(prev => prev - 1);
        } else {
          // Word is fully deleted, switch to next word and start typing
          setCurrentWordIndex(prev => (prev + 1) % words.length);
          setCharIndex(0);
          setCurrentText('');
          setIsTyping(true);
        }
      }
    }, isTyping ? 120 : 80); // Typing speed: 120ms, Deleting speed: 80ms

    return () => clearTimeout(timer);
  }, [currentWordIndex, charIndex, isTyping, isWaiting, words]);

  // Cursor blinking effect
  useEffect(() => {
    const cursorTimer = setInterval(() => {
      setShowCursor(prev => !prev);
    }, 500);

    return () => clearInterval(cursorTimer);
  }, []);

  return (
    <span className="inline-flex items-center justify-center w-[80px] text-center">
      <span className="inline-block w-[70px] text-center">
        {currentText || '\u00A0'}
      </span>
      <span className={`transition-opacity duration-100 ${showCursor ? 'opacity-100' : 'opacity-0'}`}>
        |
      </span>
    </span>
  );
}

export default function CardCV({ initialLanguage = 'eng' }) {
  const [activePage, setActivePage] = useState('principal');
  const [language, setLanguage] = useState(initialLanguage);
  const [certificateViewMode, setCertificateViewMode] = useState('tiles');

  const [isLanguageToggleVisible, setIsLanguageToggleVisible] = useState(true);
  const [showShareModal, setShowShareModal] = useState(false);
  const [linkCopied, setLinkCopied] = useState(false);
  const [scrollY, setScrollY] = useState(0);
  const [isTransforming, setIsTransforming] = useState(false);
  
  const content = language === 'eng' ? contentEng : contentEsp;

  const toggleLanguage = () => {
    setLanguage(language === 'eng' ? 'esp' : 'eng');
  };

  const handleShare = async () => {
    // Check if it's mobile/has native share
    if (navigator.share && /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
      // Use native share on mobile
      const shareData = {
        title: content.header.name,
        text: `${content.header.title} - Professional CV`,
        url: window.location.href,
      };
      
      try {
        await navigator.share(shareData);
      } catch (error) {
        console.log('Share cancelled or failed');
      }
    } else {
      // Show custom modal on desktop and automatically copy link
      setShowShareModal(true);
      
      // Automatically copy link to clipboard
      try {
        await navigator.clipboard.writeText(window.location.href);
        setLinkCopied(true);
        setTimeout(() => setLinkCopied(false), 3000);
      } catch (error) {
        // Fallback for older browsers
        const textArea = document.createElement('textarea');
        textArea.value = window.location.href;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
        setLinkCopied(true);
        setTimeout(() => setLinkCopied(false), 3000);
      }
    }
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setLinkCopied(true);
      setTimeout(() => setLinkCopied(false), 3000);
    } catch (error) {
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = window.location.href;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setLinkCopied(true);
      setTimeout(() => setLinkCopied(false), 3000);
    }
  };

  // Scroll handler for button animation
  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Create simple trail effect
  const createTrailEffect = () => {
    // Create just 3 simple trail dots
    for (let i = 0; i < 3; i++) {
      setTimeout(() => {
        const trail = document.createElement('div');
        trail.style.cssText = `
          position: fixed;
          width: ${8 - i * 2}px;
          height: ${8 - i * 2}px;
          border-radius: 50%;
          background: rgba(147, 51, 234, ${0.5 - i * 0.1});
          pointer-events: none;
          z-index: 55;
          top: 34px;
          right: 140px;
          animation: simple-move-to-position 1.5s ease-out forwards;
          animation-delay: ${i * 0.1}s;
        `;
        
        document.body.appendChild(trail);
        
        // Remove trail after animation
        setTimeout(() => {
          trail.remove();
        }, 1800);
      }, i * 100);
    }
  };

  // Intersection Observer to track language toggle visibility
  useEffect(() => {
    const languageToggle = document.querySelector('.language-toggle');
    if (!languageToggle) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting && isLanguageToggleVisible) {
          // Starting to scroll out - trigger transformation
          setIsTransforming(true);
          createTrailEffect(); // Create the trail effect
          setTimeout(() => {
            setIsLanguageToggleVisible(false);
          }, 1200); // Hide main button before animation ends
          setTimeout(() => {
            setIsTransforming(false); // Allow secondary button to appear
          }, 1500); // Wait for the simple animation to complete
        } else if (entry.isIntersecting && !isLanguageToggleVisible) {
          // Scrolling back up - reverse the process
          setIsLanguageToggleVisible(true);
          setIsTransforming(false);
        }
      },
      { threshold: 0.1 }
    );

    observer.observe(languageToggle);

    return () => observer.disconnect();
  }, [isLanguageToggleVisible]);

  // ESC key listener for share modal
  useEffect(() => {
    const handleEscKey = (event) => {
      if (event.key === 'Escape' && showShareModal) {
        setShowShareModal(false);
      }
    };

    if (showShareModal) {
      document.addEventListener('keydown', handleEscKey);
    }

    return () => {
      document.removeEventListener('keydown', handleEscKey);
    };
  }, [showShareModal]);

  return (
    <div className="max-w-6xl mx-auto bg-white shadow-xl rounded-lg overflow-hidden cv-card">
      {/* Language Button Main - Top Right with Typing Animation */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 flex justify-end border-b border-blue-200 language-toggle">
        <div className="relative">
          <button 
            id="language_button_main"
            onClick={toggleLanguage}
            className={`group relative inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-blue-700 bg-white border border-blue-300 rounded-lg hover:bg-blue-700 hover:text-white hover:border-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-300 shadow-sm hover:shadow-md min-w-[140px] ${
              isTransforming || !isLanguageToggleVisible ? 'floating-animation' : ''
            }`}
          >
            <Globe size={16} className="mr-2 flex-shrink-0 group-hover:rotate-180 transition-transform duration-300" />
            <span className="font-mono text-sm tracking-wide">
              <TypewriterText currentLanguage={language} />
            </span>
          </button>
        </div>
      </div>
      
      {/* Header Section */}
      <div className="bg-blue-800 text-white p-8 rounded-t-lg print-header">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
          <div>
            <h1 className="text-4xl font-bold tracking-tight mb-2">{content.header.name}</h1>
            <h2 className="text-xl text-blue-200 font-medium">{content.header.title}</h2>
          </div>
          <div className="flex flex-col space-y-3 text-blue-100">
            <div className="flex items-center">
              <MapPin size={18} className="mr-3 flex-shrink-0" />
              <span>{content.header.location}</span>
            </div>
            <div className="flex items-center">
              <Mail size={18} className="mr-3 flex-shrink-0" />
              <span>{content.header.email}</span>
            </div>
            <div className="flex items-center">
              <Phone size={18} className="mr-3 flex-shrink-0" />
              <span>{content.header.phone}</span>
            </div>
          </div>
        </div>
      </div>

            {/* Navigation Tabs */}
      <div className="bg-gray-100 px-8 pt-4 tab-navigation">
        <div className="flex space-x-1 -mb-px">
          <button 
            onClick={() => setActivePage('principal')}
            className={`relative px-6 py-3 font-semibold rounded-t-lg transition-all duration-200 ${
              activePage === 'principal' 
                ? 'bg-white text-blue-700 shadow-md border-t-2 border-l border-r border-blue-700 border-b-white z-10' 
                : 'bg-gray-200 text-gray-600 hover:bg-gray-300 hover:text-gray-800 border border-gray-300'
            }`}
          >
            {content.tabs.profile}
          </button>
          <button 
            onClick={() => setActivePage('historial')}
            className={`relative px-6 py-3 font-semibold rounded-t-lg transition-all duration-200 ${
              activePage === 'historial' 
                ? 'bg-white text-blue-700 shadow-md border-t-2 border-l border-r border-blue-700 border-b-white z-10' 
                : 'bg-gray-200 text-gray-600 hover:bg-gray-300 hover:text-gray-800 border border-gray-300'
            }`}
          >
            {content.tabs.history}
          </button>
          <button 
            onClick={() => setActivePage('certificates')}
            className={`relative px-6 py-3 font-semibold rounded-t-lg transition-all duration-200 ${
              activePage === 'certificates' 
                ? 'bg-white text-blue-700 shadow-md border-t-2 border-l border-r border-blue-700 border-b-white z-10' 
                : 'bg-gray-200 text-gray-600 hover:bg-gray-300 hover:text-gray-800 border border-gray-300'
            }`}
          >
            {content.tabs.certificates}
          </button>
        </div>
      </div>

      {/* Tab content area with complete border */}
      <div className="bg-white border-t border-gray-300 tab-content-border"></div>

      {activePage === 'principal' && (
        <div className="p-8 max-w-5xl mx-auto space-y-8 print:!block print:max-w-none">
          {/* Professional Summary */}
          <div className="print-section">
            <div className="flex items-center mb-4">
              <User size={22} className="text-blue-700 mr-3" />
              <h3 className="text-xl font-bold text-gray-800">{content.sections.profile.title}</h3>
            </div>
            <p className="text-gray-700 leading-relaxed">
              {content.sections.profile.description}
            </p>
          </div>

          {/* Technical Expertise */}
          <div>
            <div className="flex items-center mb-4">
              <Wrench size={22} className="text-blue-700 mr-3" />
              <h3 className="text-xl font-bold text-gray-800">{content.sections.technical.title}</h3>
            </div>
            <div className="space-y-4">
              {content.sections.technical.skills.map((skill, index) => (
                <div key={index}>
                  <div className="flex items-center mb-2">
                    <ChevronRight size={16} className="text-blue-700 mr-2" />
                    <span className="font-semibold text-gray-800">{skill.name}</span>
                  </div>
                  <p className="text-sm text-gray-600 ml-6 leading-relaxed">{skill.description}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Education, Languages & Professional Competencies - Two Column Layout */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Left Column - Professional Competencies (Quadrants II & III) */}
            <div>
              {/* Professional Competencies */}
              <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-md hover:shadow-lg transition-shadow duration-200 h-full">
                <div className="flex items-center mb-4">
                  <Award size={22} className="text-blue-700 mr-3" />
                  <h3 className="text-xl font-bold text-gray-800">{content.sections.competencies.title}</h3>
                </div>
                <div className="grid grid-cols-1 gap-3">
                  {content.sections.competencies.items.map((comp, index) => (
                    <div key={index} className="flex items-center">
                      <CheckCircle size={16} className="text-blue-700 mr-3 flex-shrink-0" />
                      <span className="text-gray-700">{comp}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Column - Education & Languages (Quadrants I & IV) */}
            <div className="space-y-8">
              {/* Education (Quadrant I) */}
              <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-md hover:shadow-lg transition-shadow duration-200">
                <div className="flex items-center mb-4">
                  <Book size={22} className="text-blue-700 mr-3" />
                  <h3 className="text-xl font-bold text-gray-800">{content.sections.education.title}</h3>
                </div>
                <div className="space-y-2">
                  <div className="font-semibold text-gray-800">{content.sections.education.degree}</div>
                  <div className="text-gray-600">{content.sections.education.institution}</div>
                  <div className="text-gray-500 italic">{content.sections.education.license}</div>
                </div>
              </div>
              
              {/* Languages (Quadrant IV) */}
              <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-md hover:shadow-lg transition-shadow duration-200">
                <div className="flex items-center mb-4">
                  <Languages size={22} className="text-blue-700 mr-3" />
                  <h3 className="text-xl font-bold text-gray-800">{content.sections.languages.title}</h3>
                </div>
                <div className="space-y-3">
                  {content.sections.languages.items.map((lang, index) => (
                    <div key={index}>
                      <div className="font-semibold text-gray-800">{lang.language}</div>
                      <div className="text-gray-600">{lang.level}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
          
          {/* Objective */}
          <div>
            <div className="flex items-center mb-4">
              <FileText size={22} className="text-blue-700 mr-3" />
              <h3 className="text-xl font-bold text-gray-800">{content.sections.objective.title}</h3>
            </div>
            <div className="bg-blue-50 p-4 rounded-lg border-l-4 border-blue-700">
              <p className="text-gray-700 leading-relaxed">
                {content.sections.objective.description}
              </p>
            </div>
          </div>

          {/* Experience Section */}
          <div>
            <div className="flex items-center mb-6">
              <Briefcase size={22} className="text-blue-700 mr-3" />
              <h3 className="text-xl font-bold text-gray-800">{content.sections.experience.title}</h3>
            </div>

            {/* Primary Experience */}
            <div className="border-l-4 border-blue-700 pl-6 mb-8">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h4 className="text-xl font-bold text-gray-800 mb-1">{content.sections.experience.primary.position}</h4>
                  <div className="text-blue-700 font-semibold text-lg">{content.sections.experience.primary.company}</div>
                </div>
                <div className="flex items-center bg-blue-100 px-3 py-2 rounded-lg text-blue-800 font-medium">
                  <Calendar size={16} className="mr-2" />
                  <span>{content.sections.experience.primary.period}</span>
                </div>
              </div>
              <p className="text-gray-700 mb-4 leading-relaxed">
                {content.sections.experience.primary.description}
              </p>
              <ul className="space-y-3 text-gray-700">
                {content.sections.experience.primary.achievements.map((achievement, index) => (
                  <li key={index} className="flex items-start">
                    <div className="w-2 h-2 bg-blue-700 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                    <span className="leading-relaxed">{achievement}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Additional Experience */}
            <div className="mb-8">
              <h3 className="text-xl font-bold text-gray-800 mb-6">{content.sections.experience.additional.title}</h3>
              
              <div className="space-y-6">
                {content.sections.experience.additional.jobs.map((job, index) => (
                  <div key={index} className="border-l-2 border-gray-300 pl-6">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h4 className="font-bold text-gray-800 text-lg mb-1">{job.position}</h4>
                        <div className="text-gray-600">{job.company}</div>
                      </div>
                      <div className="flex items-center bg-gray-100 px-3 py-2 rounded-lg text-gray-600 font-medium">
                        <Calendar size={16} className="mr-2" />
                        <span>{job.period}</span>
                      </div>
                    </div>
                    <p className="text-gray-700 leading-relaxed">
                      {job.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Featured Projects */}
            <div>
              <h3 className="text-xl font-bold text-gray-800 mb-6">{content.sections.projects.title}</h3>
              <div className="space-y-4">
                {content.sections.projects.items.map((project, index) => (
                  <div key={index} className="bg-blue-50 p-4 rounded-lg border-l-4 border-blue-700">
                    <h4 className="font-semibold text-gray-800 mb-2">{project.name}</h4>
                    <p className="text-gray-700 leading-relaxed">
                      {project.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
      
      {activePage === 'historial' && (
        // Timeline Page
        <div className="p-8 print:!block">
          <div className="print-break-before">
            <h3 className="text-2xl font-bold text-gray-800 mb-4">{content.timeline.title}</h3>
            <p className="text-gray-600 mb-8 text-lg">{content.timeline.subtitle}</p>
          </div>
          
          <div className="relative">
            {/* Timeline line positioned exactly through the center of the blue circles */}
            <div className="absolute w-0.5 bg-blue-700" style={{left: '23px', top: '24px', bottom: '0'}}></div>
            
            <div className="space-y-8">
              {content.timeline.jobs.map((job, index) => (
                <div key={index} className="flex items-start relative">
                  {/* Clock icon positioned to align with the vertical line */}
                  <div className="flex-shrink-0 w-12 h-12 bg-blue-700 rounded-full flex items-center justify-center relative shadow-sm">
                    <Clock size={20} className="text-white" />
                  </div>
                  <div className="ml-6 flex-1">
                    <div className="bg-white p-6 border border-gray-200 rounded-lg shadow-sm">
                      <div className="flex justify-between items-start mb-3">
                        <h4 className="font-bold text-gray-800 text-lg">{job.position}</h4>
                        <span className="text-gray-600 font-medium">{job.period}</span>
                      </div>
                      <p className="text-blue-700 font-semibold mb-3">{job.company}</p>
                      <p className="text-gray-700 leading-relaxed">
                        {job.description}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activePage === 'certificates' && (
        // Certificates Page
        <div className="p-8 print:!block">
          <div className="print-break-before">
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 mb-8">
              <div>
                <div className="flex items-center mb-4">
                  <Award size={28} className="text-blue-700 mr-3" />
                  <h3 className="text-2xl font-bold text-gray-800">{content.sections.certificates.title}</h3>
                </div>
                <p className="text-gray-600 text-lg">{content.sections.certificates.description}</p>
              </div>
              
              {/* View Mode Toggle */}
              <div className="flex items-center space-x-2 bg-gray-100 p-2 rounded-lg view-mode-toggle">
                <button 
                  onClick={() => setCertificateViewMode('list')}
                  className={`p-2 rounded transition-colors ${
                    certificateViewMode === 'list' 
                      ? 'bg-blue-700 text-white' 
                      : 'text-gray-600 hover:bg-gray-200'
                  }`}
                  title={content.sections.certificates.viewModes.list}
                >
                  <List size={18} />
                </button>
                <button 
                  onClick={() => setCertificateViewMode('tiles')}
                  className={`p-2 rounded transition-colors ${
                    certificateViewMode === 'tiles' 
                      ? 'bg-blue-700 text-white' 
                      : 'text-gray-600 hover:bg-gray-200'
                  }`}
                  title={content.sections.certificates.viewModes.tiles}
                >
                  <Grid size={18} />
                </button>
                <button 
                  onClick={() => setCertificateViewMode('large')}
                  className={`p-2 rounded transition-colors ${
                    certificateViewMode === 'large' 
                      ? 'bg-blue-700 text-white' 
                      : 'text-gray-600 hover:bg-gray-200'
                  }`}
                  title={content.sections.certificates.viewModes.large}
                >
                  <Eye size={18} />
                </button>
              </div>
            </div>
          </div>

          {/* Certificates Grid */}
          <div className={`grid gap-6 certificate-grid ${
            certificateViewMode === 'list' 
              ? 'grid-cols-1' 
              : certificateViewMode === 'tiles' 
              ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'
              : 'grid-cols-1 lg:grid-cols-2'
          }`}>
            {content.sections.certificates.items.map((cert, index) => (
              <div key={cert.id} className={`bg-white border border-gray-200 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200 overflow-hidden certificate-card ${
                certificateViewMode === 'list' ? 'flex flex-row' : 'flex flex-col'
              }`}>
                {/* PDF Preview */}
                <div className={`bg-gray-100 flex items-center justify-center certificate-preview ${
                  certificateViewMode === 'list' 
                    ? 'w-24 h-24 flex-shrink-0' 
                    : certificateViewMode === 'tiles' 
                    ? 'h-48' 
                    : 'h-64'
                }`}>
                  <iframe
                    src={`${cert.file}#toolbar=0&navpanes=0&scrollbar=0`}
                    className="w-full h-full border-0"
                    title={cert.name}
                  />
                </div>
                
                {/* Certificate Info */}
                <div className={`p-4 ${certificateViewMode === 'list' ? 'flex-1' : ''}`}>
                  <div className="flex justify-between items-start mb-2">
                    <h4 className={`font-bold text-gray-800 ${
                      certificateViewMode === 'list' ? 'text-sm' : 'text-lg'
                    }`}>
                      {cert.name}
                    </h4>
                    <span className={`text-gray-500 font-medium ${
                      certificateViewMode === 'list' ? 'text-xs' : 'text-sm'
                    }`}>
                      {cert.date}
                    </span>
                  </div>
                  
                  <div className={`text-blue-700 font-semibold mb-2 ${
                    certificateViewMode === 'list' ? 'text-xs' : 'text-sm'
                  }`}>
                    {cert.type}
                  </div>
                  
                  <p className={`text-gray-600 mb-3 ${
                    certificateViewMode === 'list' ? 'text-xs line-clamp-2' : 'text-sm'
                  }`}>
                    {cert.description}
                  </p>
                  
                  <div className={`text-gray-500 mb-4 ${
                    certificateViewMode === 'list' ? 'text-xs' : 'text-sm'
                  }`}>
                    <strong>Issuer:</strong> {cert.issuer}
                  </div>
                  
                  {/* Action Buttons */}
                  <div className="flex space-x-2">
                    <a
                      href={cert.file}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`bg-blue-700 text-white px-3 py-2 rounded hover:bg-blue-800 transition-colors flex items-center ${
                        certificateViewMode === 'list' ? 'text-xs' : 'text-sm'
                      }`}
                    >
                      <ExternalLink size={certificateViewMode === 'list' ? 12 : 16} className="mr-1" />
                      View
                    </a>
                    <a
                      href={cert.file}
                      download
                      className={`border border-blue-700 text-blue-700 px-3 py-2 rounded hover:bg-blue-50 transition-colors flex items-center ${
                        certificateViewMode === 'list' ? 'text-xs' : 'text-sm'
                      }`}
                    >
                      <Download size={certificateViewMode === 'list' ? 12 : 16} className="mr-1" />
                      Download
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Print-only: Chronological History */}
      <div className="hidden print:block print-break-before">
        <div className="p-8">
          <div className="print-break-before">
            <h3 className="text-2xl font-bold text-gray-800 mb-4">{content.timeline.title}</h3>
            <p className="text-gray-600 mb-8 text-lg">{content.timeline.subtitle}</p>
          </div>
          
          <div className="relative">
            {/* Timeline line positioned exactly through the center of the blue circles */}
            <div className="absolute w-0.5 bg-blue-700" style={{left: '23px', top: '24px', bottom: '0'}}></div>
            
            <div className="space-y-8">
              {content.timeline.jobs.map((job, index) => (
                <div key={index} className="flex items-start relative">
                  {/* Clock icon positioned to align with the vertical line */}
                  <div className="flex-shrink-0 w-12 h-12 bg-blue-700 rounded-full flex items-center justify-center relative shadow-sm">
                    <Clock size={20} className="text-white" />
                  </div>
                  <div className="ml-6 flex-1">
                    <div className="bg-white p-6 border border-gray-200 rounded-lg shadow-sm">
                      <div className="flex justify-between items-start mb-3">
                        <h4 className="font-bold text-gray-800 text-lg">{job.position}</h4>
                        <span className="text-gray-600 font-medium">{job.period}</span>
                      </div>
                      <p className="text-blue-700 font-semibold mb-3">{job.company}</p>
                      <p className="text-gray-700 leading-relaxed">
                        {job.description}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Share Modal */}
      {showShareModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60] no-print">
          <div className="bg-white rounded-2xl p-6 w-96 max-w-[90vw] shadow-2xl">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-gray-800">Share</h3>
              <button
                onClick={() => setShowShareModal(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors p-1"
              >
                ✕
              </button>
            </div>

            {/* CV Info */}
            <div className="flex items-center mb-6 p-3 bg-gray-50 rounded-lg">
              <div className="w-12 h-12 bg-blue-700 rounded-lg flex items-center justify-center mr-3">
                <User size={20} className="text-white" />
              </div>
              <div>
                <h4 className="font-semibold text-gray-800">{content.header.name}</h4>
                <p className="text-sm text-gray-600">{content.header.title}</p>
              </div>
            </div>

            {/* Link Section */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">Link to share</label>
              <div className="flex items-center space-x-2">
                <input
                  type="text"
                  value={window.location.href}
                  readOnly
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-sm text-gray-600"
                />
                <button
                  onClick={copyToClipboard}
                  className="px-4 py-2 bg-blue-700 text-white rounded-lg hover:bg-blue-800 transition-colors text-sm font-medium"
                >
                  COPY LINK
                </button>
              </div>
              
              {/* Copy confirmation */}
              {linkCopied && (
                <div className="mt-2 text-sm text-green-600 flex items-center">
                  <CheckCircle size={16} className="mr-1" />
                  Link copied to clipboard!
                </div>
              )}
            </div>

            {/* Share Options */}
            <div className="flex justify-center space-x-8">
              {/* WhatsApp */}
              <a
                href={`https://wa.me/?text=${encodeURIComponent(`Check out ${content.header.name}'s CV: ${window.location.href}`)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex flex-col items-center space-y-2 group"
              >
                <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center group-hover:bg-green-600 transition-colors">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="white">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488"/>
                  </svg>
                </div>
                <span className="text-xs text-gray-600">WhatsApp</span>
              </a>

              {/* X (Twitter) */}
              <a
                href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(`Check out ${content.header.name}'s CV`)}&url=${encodeURIComponent(window.location.href)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex flex-col items-center space-y-2 group"
              >
                <div className="w-12 h-12 bg-black rounded-full flex items-center justify-center group-hover:bg-gray-800 transition-colors">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="white">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                  </svg>
                </div>
                <span className="text-xs text-gray-600">X</span>
              </a>

              {/* Gmail */}
              <a
                href={`mailto:?subject=${encodeURIComponent(`${content.header.name} - Professional CV`)}&body=${encodeURIComponent(`Check out ${content.header.name}'s professional CV: ${window.location.href}`)}`}
                className="flex flex-col items-center space-y-2 group"
              >
                <div className="w-12 h-12 bg-red-500 rounded-full flex items-center justify-center group-hover:bg-red-600 transition-colors">
                  <Mail size={20} className="text-white" />
                </div>
                <span className="text-xs text-gray-600">Gmail</span>
              </a>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="bg-gray-50 p-6 text-center text-gray-600 border-t print-footer">
        <p className="text-lg">{content.footer}</p>
      </div>

      {/* Floating Action Buttons */}
      <div className="fixed bottom-6 right-6 flex flex-col space-y-4 z-40 no-print">
        {/* Language Button Secondary - Appears when dot arrives */}
        {!isLanguageToggleVisible && !isTransforming && (
          <button
            id="language_button_secondary"
            onClick={toggleLanguage}
            className="w-14 h-14 bg-purple-600 hover:bg-purple-700 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center group living-button orb-arrival-animation"
            title="Toggle Language"
          >
            <Globe size={20} className="group-hover:rotate-180 group-hover:scale-110 transition-all duration-300" />
          </button>
        )}

        {/* Share Button */}
        <button
          onClick={handleShare}
          className="w-14 h-14 bg-green-600 hover:bg-green-700 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center group"
          title="Share CV"
        >
          <Share2 size={20} className="group-hover:scale-110 transition-transform duration-200" />
        </button>

        {/* Print Button */}
        <button
          onClick={() => window.print()}
          className="w-14 h-14 bg-blue-700 hover:bg-blue-800 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center group"
          title="Print CV"
        >
          <Printer size={20} className="group-hover:scale-110 transition-transform duration-200" />
        </button>
      </div>
    </div>
  );
} 