import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Download, Trophy, Calendar, User, Mail, Phone, MapPin, Printer, FileText, ChevronRight } from 'lucide-react';
import { Participant, cn, formatSecondsToTime } from '../constants';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { LOGO_WHITE_BASE64, CERTIFICATE_BG_BASE64 } from '../assets';

interface ParticipantDetailProps {
  participants: Participant[];
}

export default function ParticipantDetail({ participants }: ParticipantDetailProps) {
  const { name } = useParams<{ name: string }>();
  const userRaces = participants.filter(p => p.name === decodeURIComponent(name || ''));
  const [selectedRaceIdx, setSelectedRaceIdx] = React.useState(userRaces.length - 1);
  
  if (userRaces.length === 0) {
    return (
      <div className="text-center py-20 bg-black min-h-screen text-white">
        <h2 className="text-2xl font-black uppercase tracking-widest">Participant not found</h2>
        <Link to="/" className="text-maroon hover:underline mt-4 inline-block font-bold">Back to Leaderboard</Link>
      </div>
    );
  }

  const currentRace = userRaces[selectedRaceIdx];
  const personalBest = [...userRaces].sort((a, b) => a.seconds - b.seconds)[0];

  const [generatingType, setGeneratingType] = React.useState<'none' | 'certificate' | 'summary'>('none');

  const downloadCertificate = async (race: Participant) => {
    const element = document.getElementById(`certificate-template`);
    if (!element) return;
    
    setGeneratingType('certificate');
    try {
      const canvas = await html2canvas(element, { 
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#000000',
        logging: false,
        width: 1123,
        height: 794,
        scrollX: 0,
        scrollY: 0,
        windowWidth: 1123,
        windowHeight: 794,
        onclone: (clonedDoc) => {
          const el = clonedDoc.getElementById('certificate-template');
          if (el) {
            el.style.opacity = '1';
            el.style.visibility = 'visible';
          }
        }
      });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('l', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`FitCode_Certificate_${race.name.replace(/\s+/g, '_')}.pdf`);
    } catch (error) {
      console.error('Certificate generation failed:', error);
      alert('Failed to generate certificate. Please try again.');
    } finally {
      setGeneratingType('none');
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const downloadSummary = async () => {
    const element = document.getElementById(`summary-capture-area`);
    if (!element) return;
    
    setGeneratingType('summary');
    try {
      const canvas = await html2canvas(element, { 
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#000000',
        logging: false,
        width: 800, // Match the fixed width of the element
        scrollX: 0,
        scrollY: 0,
        windowWidth: 800,
        onclone: (clonedDoc) => {
          const clonedElement = clonedDoc.getElementById('summary-capture-area');
          if (clonedElement) {
            clonedElement.style.width = '800px';
            clonedElement.style.maxWidth = 'none';
          }
          const branding = clonedDoc.getElementById('summary-branding');
          if (branding) {
            branding.style.display = 'flex';
          }
        }
      });
      const imgData = canvas.toDataURL('image/png');
      const pdfWidth = 210;
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      const pdf = new jsPDF({
        orientation: 'p',
        unit: 'mm',
        format: [pdfWidth, pdfHeight]
      });
      
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`FitCode_Summary_${currentRace.name.replace(/\s+/g, '_')}.pdf`);
    } catch (error) {
      console.error('Summary generation failed:', error);
      alert('Failed to generate summary PDF. Please try again.');
    } finally {
      setGeneratingType('none');
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8 text-white font-sans print:p-0">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-white/10 pb-4 print:hidden px-4 sm:px-0">
        <div className="flex items-center gap-4">
          <Link 
            to="/" 
            className="p-2 hover:bg-white/10 rounded-full transition-colors group"
            title="Back to Leaderboard"
          >
            <ArrowLeft className="w-6 h-6 text-white/60 group-hover:text-white" />
          </Link>
          <h1 className="text-xl sm:text-2xl font-black uppercase tracking-widest italic">Results</h1>
        </div>
        <div className="w-full sm:w-auto">
          <select 
            value={selectedRaceIdx}
            onChange={(e) => setSelectedRaceIdx(parseInt(e.target.value))}
            className="w-full sm:w-auto bg-black border border-white/20 rounded px-4 py-2 text-xs font-bold focus:outline-none focus:border-maroon"
          >
            {userRaces.map((r, idx) => (
              <option key={r.tabName} value={idx}>{r.tabName}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="px-4 sm:px-0">
        {/* Responsive Preview (Visible on screen) */}
        <div className="bg-[#0a0a0a] border border-white/5 rounded-2xl p-6 sm:p-8 shadow-2xl print:hidden">
          <div className="flex flex-col gap-8">
            <div className="flex items-center gap-6 border-b border-maroon/30 pb-6">
              <img src={LOGO_WHITE_BASE64} alt="Logo" className="w-16 h-16 object-contain" />
              <div>
                <div className="text-2xl font-black italic tracking-tight">FIT CODE</div>
                <div className="text-[10px] font-bold uppercase tracking-[0.3em] text-maroon">Race Summary Report</div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-4">
                <h3 className="text-sm font-black uppercase tracking-widest text-maroon border-b border-maroon/20 pb-2">Participant</h3>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm"><span className="text-white/40 font-bold uppercase">Name</span><span className="font-black uppercase">{currentRace.name}</span></div>
                  {currentRace.age && (
                    <div className="flex justify-between text-sm"><span className="text-white/40 font-bold uppercase">Age</span><span className="font-black uppercase">{currentRace.age}</span></div>
                  )}
                  <div className="flex justify-between text-sm"><span className="text-white/40 font-bold uppercase">Age Group</span><span className="font-black uppercase">{currentRace.ageGroup}</span></div>
                  <div className="flex justify-between text-sm"><span className="text-white/40 font-bold uppercase">Gender</span><span className="font-black uppercase">{currentRace.gender}</span></div>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-sm font-black uppercase tracking-widest text-maroon border-b border-maroon/20 pb-2">Race Details</h3>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm"><span className="text-white/40 font-bold uppercase">Race</span><span className="font-black uppercase">{currentRace.tabName}</span></div>
                  <div className="flex justify-between text-sm"><span className="text-white/40 font-bold uppercase">Division</span><span className="font-black uppercase">{currentRace.level}</span></div>
                </div>
              </div>

              <div className="md:col-span-2 space-y-4">
                <h3 className="text-sm font-black uppercase tracking-widest text-maroon border-b border-maroon/20 pb-2">Overall Time</h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="bg-white/5 p-4 rounded-xl border border-white/5">
                    <div className="text-[10px] font-black uppercase tracking-widest text-white/20 mb-1">Rank (M/W)</div>
                    <div className="text-2xl font-black italic">#{currentRace.rankOverall}</div>
                  </div>
                  <div className="bg-white/5 p-4 rounded-xl border border-white/5">
                    <div className="text-[10px] font-black uppercase tracking-widest text-white/20 mb-1">Rank (Division)</div>
                    <div className="text-2xl font-black italic text-maroon">#{currentRace.rankDivision}</div>
                  </div>
                  <div className="bg-white/5 p-4 rounded-xl border border-white/5">
                    <div className="text-[10px] font-black uppercase tracking-widest text-white/20 mb-1">Rank (AG)</div>
                    <div className="text-2xl font-black italic">#{currentRace.rankAgeGroup}</div>
                  </div>
                </div>
                <div className="flex justify-between items-end pt-4">
                  <span className="text-xs font-black uppercase tracking-[0.2em] text-white/40">Official Time</span>
                  <span className="text-4xl sm:text-6xl font-black font-mono text-maroon italic tracking-tighter">{currentRace.completionTime}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Hidden Capture Area (Fixed width for PDF consistency) */}
        <div className="absolute left-[-9999px] top-0">
          <div id="summary-capture-area" style={{ width: '800px', backgroundColor: '#000000', padding: '48px', color: '#FFFFFF', fontFamily: 'sans-serif' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '48px' }}>
              <div id="summary-branding" style={{ display: 'flex', alignItems: 'center', gap: '24px', borderBottom: '2px solid #800000', paddingBottom: '24px' }}>
                <img src={LOGO_WHITE_BASE64} alt="Logo" style={{ width: '80px', height: '80px', objectFit: 'contain' }} />
                <div>
                  <div style={{ fontSize: '32px', fontWeight: '900', fontStyle: 'italic', letterSpacing: '-0.02em', color: '#FFFFFF' }}>FIT CODE</div>
                  <div style={{ fontSize: '14px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.3em', color: '#800000' }}>Race Summary Report</div>
                </div>
              </div>

              <section>
                <h2 style={{ fontSize: '20px', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '24px', paddingBottom: '8px', color: '#800000', borderBottom: '1px solid rgba(128, 0, 0, 0.3)', margin: 0 }}>Participant</h2>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '8px', borderBottom: '1px solid rgba(255, 255, 255, 0.05)' }}>
                    <span style={{ fontSize: '14px', fontWeight: '700', textTransform: 'uppercase', color: 'rgba(255, 255, 255, 0.4)' }}>Name</span>
                    <span style={{ fontSize: '14px', fontWeight: '900', textTransform: 'uppercase', color: '#FFFFFF' }}>{currentRace.name}</span>
                  </div>
                  {currentRace.age && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '8px', borderBottom: '1px solid rgba(255, 255, 255, 0.05)' }}>
                      <span style={{ fontSize: '14px', fontWeight: '700', textTransform: 'uppercase', color: 'rgba(255, 255, 255, 0.4)' }}>Age</span>
                      <span style={{ fontSize: '14px', fontWeight: '900', textTransform: 'uppercase', color: '#FFFFFF' }}>{currentRace.age}</span>
                    </div>
                  )}
                  <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '8px', borderBottom: '1px solid rgba(255, 255, 255, 0.05)' }}>
                    <span style={{ fontSize: '14px', fontWeight: '700', textTransform: 'uppercase', color: 'rgba(255, 255, 255, 0.4)' }}>Age Group</span>
                    <span style={{ fontSize: '14px', fontWeight: '900', textTransform: 'uppercase', color: '#FFFFFF' }}>{currentRace.ageGroup}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '8px', borderBottom: '1px solid rgba(255, 255, 255, 0.05)' }}>
                    <span style={{ fontSize: '14px', fontWeight: '700', textTransform: 'uppercase', color: 'rgba(255, 255, 255, 0.4)' }}>Gender</span>
                    <span style={{ fontSize: '14px', fontWeight: '900', textTransform: 'uppercase', color: '#FFFFFF' }}>{currentRace.gender}</span>
                  </div>
                </div>
              </section>

              <section>
                <h2 style={{ fontSize: '20px', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '24px', paddingBottom: '8px', color: '#800000', borderBottom: '1px solid rgba(128, 0, 0, 0.3)', margin: 0 }}>Race Details</h2>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '8px', borderBottom: '1px solid rgba(255, 255, 255, 0.05)' }}>
                    <span style={{ fontSize: '14px', fontWeight: '700', textTransform: 'uppercase', color: 'rgba(255, 255, 255, 0.4)' }}>Race</span>
                    <span style={{ fontSize: '14px', fontWeight: '900', textTransform: 'uppercase', color: '#FFFFFF' }}>{currentRace.tabName}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '8px', borderBottom: '1px solid rgba(255, 255, 255, 0.05)' }}>
                    <span style={{ fontSize: '14px', fontWeight: '700', textTransform: 'uppercase', color: 'rgba(255, 255, 255, 0.4)' }}>Division</span>
                    <span style={{ fontSize: '14px', fontWeight: '900', textTransform: 'uppercase', color: '#FFFFFF' }}>{currentRace.level}</span>
                  </div>
                </div>
              </section>

              <section>
                <h2 style={{ fontSize: '20px', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '24px', paddingBottom: '8px', color: '#800000', borderBottom: '1px solid rgba(128, 0, 0, 0.3)', margin: 0 }}>Overall Time</h2>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '8px', borderBottom: '1px solid rgba(255, 255, 255, 0.05)' }}>
                    <span style={{ fontSize: '14px', fontWeight: '700', textTransform: 'uppercase', color: 'rgba(255, 255, 255, 0.4)' }}>Rank (M/W)</span>
                    <span style={{ fontSize: '14px', fontWeight: '900', textTransform: 'uppercase', color: '#FFFFFF' }}>{currentRace.rankOverall}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '8px', borderBottom: '1px solid rgba(255, 255, 255, 0.05)' }}>
                    <span style={{ fontSize: '14px', fontWeight: '700', textTransform: 'uppercase', color: 'rgba(255, 255, 255, 0.4)' }}>Rank (Division)</span>
                    <span style={{ fontSize: '14px', fontWeight: '900', textTransform: 'uppercase', color: '#FFFFFF' }}>{currentRace.rankDivision}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '8px', borderBottom: '1px solid rgba(255, 255, 255, 0.05)' }}>
                    <span style={{ fontSize: '14px', fontWeight: '700', textTransform: 'uppercase', color: 'rgba(255, 255, 255, 0.4)' }}>Rank (AG)</span>
                    <span style={{ fontSize: '14px', fontWeight: '900', textTransform: 'uppercase', color: '#FFFFFF' }}>{currentRace.rankAgeGroup}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '16px' }}>
                    <span style={{ fontSize: '14px', fontWeight: '700', textTransform: 'uppercase', color: 'rgba(255, 255, 255, 0.4)' }}>Overall Time</span>
                    <span style={{ fontSize: '30px', fontWeight: '900', fontFamily: 'monospace', color: '#800000' }}>{currentRace.completionTime}</span>
                  </div>
                </div>
              </section>
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row justify-center gap-4 pt-8 print:hidden px-4 sm:px-0">
        <button
          onClick={() => downloadCertificate(currentRace)}
          disabled={generatingType !== 'none'}
          className="w-full sm:w-fit px-12 text-white py-4 sm:py-3 rounded text-xs font-black uppercase tracking-widest hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          style={{ backgroundColor: '#800000' }}
        >
          {generatingType === 'certificate' ? 'Generating...' : 'Certificate'}
        </button>
        <button
          onClick={downloadSummary}
          disabled={generatingType !== 'none'}
          className="w-full sm:w-fit px-12 bg-white/10 text-white py-4 sm:py-3 rounded text-xs font-black uppercase tracking-widest hover:bg-white/20 transition-colors disabled:opacity-50"
        >
          {generatingType === 'summary' ? 'Generating...' : 'Race Summary'}
        </button>
      </div>

      {/* Certificate Template - Positioned off-screen but accessible for html2canvas */}
      <div style={{ position: 'absolute', left: '-9999px', top: 0 }}>
        <div id="certificate-template" style={{ 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'center', 
          justifyContent: 'center', 
          position: 'relative', 
          width: '1123px', 
          height: '794px', 
          backgroundColor: '#000000', 
          color: '#FFFFFF', 
          padding: '60px 80px', 
          border: '30px solid #800000', 
          boxSizing: 'border-box', 
          fontFamily: 'sans-serif',
          overflow: 'hidden'
        }}>
          <img 
            src={CERTIFICATE_BG_BASE64 || "https://images.unsplash.com/photo-1448375240586-882707db888b?q=80&w=1123&h=794&auto=format&fit=crop"} 
            alt="Background" 
            crossOrigin={CERTIFICATE_BG_BASE64?.startsWith('data:') ? undefined : "anonymous"}
            style={{ 
              position: 'absolute', 
              top: 0, 
              left: 0, 
              width: '1123px', 
              height: '794px', 
              objectFit: 'cover', 
              zIndex: 1,
              opacity: 0.7
            }} 
          />
          <div style={{ position: 'absolute', inset: 0, backgroundColor: 'rgba(0,0,0,0.2)', zIndex: 2 }}></div>
          <div style={{ position: 'relative', zIndex: 10, textAlign: 'center', marginBottom: '40px' }}>
            <div style={{ margin: '0 auto 16px auto', width: '100px', height: '100px' }}>
              <img src={LOGO_WHITE_BASE64} alt="Logo" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
            </div>
            <div style={{ fontSize: '64px', fontWeight: '900', letterSpacing: '-0.05em', marginBottom: '4px', fontStyle: 'italic', color: '#FFFFFF' }}>FIT CODE</div>
            <div style={{ fontSize: '18px', textTransform: 'uppercase', letterSpacing: '0.6em', fontWeight: '900', color: '#800000' }}>Official Finisher Certificate</div>
          </div>
          
          <div style={{ position: 'relative', zIndex: 10, textAlign: 'center', flexGrow: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <div style={{ fontSize: '18px', textTransform: 'uppercase', letterSpacing: '0.4em', fontWeight: '700', color: '#666666', marginBottom: '16px' }}>This is to certify that</div>
            <div style={{ fontSize: '84px', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '-0.02em', fontStyle: 'italic', color: '#FFFFFF', marginBottom: '16px', lineHeight: 1 }}>{currentRace.name}</div>
            <div style={{ fontSize: '18px', textTransform: 'uppercase', letterSpacing: '0.4em', fontWeight: '700', color: '#666666', marginBottom: '16px' }}>has successfully completed</div>
            <div style={{ fontSize: '42px', fontWeight: '900', textTransform: 'uppercase', fontStyle: 'italic', color: '#800000' }}>{currentRace.tabName}</div>
          </div>
          
          <div style={{ position: 'relative', zIndex: 10, display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '40px', width: '100%', textAlign: 'center', paddingTop: '40px', borderTop: '1px solid rgba(255,255,255,0.1)', marginTop: '40px' }}>
            <div>
              <div style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.4em', marginBottom: '8px', fontWeight: '900', color: '#666666' }}>Total Time</div>
              <div style={{ fontSize: '42px', fontWeight: '900', fontFamily: 'monospace', fontStyle: 'italic', color: '#FFFFFF' }}>{currentRace.completionTime}</div>
            </div>
            <div>
              <div style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.4em', marginBottom: '8px', fontWeight: '900', color: '#666666' }}>Division Rank</div>
              <div style={{ fontSize: '42px', fontWeight: '900', fontStyle: 'italic', color: '#800000' }}>#{currentRace.rankDivision}</div>
            </div>
            <div>
              <div style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.4em', marginBottom: '8px', fontWeight: '900', color: '#666666' }}>AG Ranking</div>
              <div style={{ fontSize: '42px', fontWeight: '900', fontStyle: 'italic', color: '#FFFFFF' }}>#{currentRace.rankAgeGroup}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
