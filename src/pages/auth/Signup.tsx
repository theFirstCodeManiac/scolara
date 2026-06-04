import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { ArrowLeft, Upload, CheckCircle2, User, Sparkles } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../lib/supabase';
import { fetchNigerianUniversities, University } from '../../services/universityApi';

export const Signup: React.FC = () => {
// _navigate removed - unused
  const { signUp } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  // Dynamic Universities Data
  const [universities, setUniversities] = useState<University[]>([]);
  const [isLoadingUnis, setIsLoadingUnis] = useState(true);

  // Form State
  const [firstName, setFirstName] = useState('');
  const [middleName, setMiddleName] = useState('');
  const [username, setUsername] = useState('');
  const [matricNumber, setMatricNumber] = useState('');
  const [dob, setDob] = useState('');
  const [gender, setGender] = useState('');
  const [uniId, setUniId] = useState('');
  const [facultyId, setFacultyId] = useState('');
  const [department, setDepartment] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // Profile Picture Upload State
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const loadUniversities = async () => {
      setIsLoadingUnis(true);
      const data = await fetchNigerianUniversities();
      setUniversities(data);
      setIsLoadingUnis(false);
    };
    loadUniversities();
  }, []);

  const selectedUni = universities.find(u => u.id === uniId);
  const selectedFaculty = selectedUni?.faculties.find(f => f.id === facultyId);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        setError('Avatar size must be less than 2MB');
        return;
      }
      setAvatarFile(file);
      setAvatarPreview(URL.createObjectURL(file));
    }
  };

  const triggerFileSelect = () => {
    fileInputRef.current?.click();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setSuccess(false);

    let avatarUrl = '';

    // Handle Profile Picture upload to Supabase storage if selected
    if (avatarFile) {
      try {
        const fileExt = avatarFile.name.split('.').pop();
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}.${fileExt}`;
        
        // Ensure avatars bucket is referenced (will fall back gracefully if missing)
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('avatars')
          .upload(fileName, avatarFile, { cacheControl: '3600', upsert: true });

        if (!uploadError && uploadData) {
          const { data: { publicUrl } } = supabase.storage
            .from('avatars')
            .getPublicUrl(fileName);
          avatarUrl = publicUrl;
        }
      } catch (err) {
        console.warn("Avatar upload failed, continuing with registration anyway.", err);
      }
    }

    const metadata = {
      first_name: firstName,
      middle_name: middleName,
      username,
      matric_number: matricNumber,
      university: selectedUni?.name || '',
      faculty: selectedFaculty?.name || '',
      department,
      dob,
      gender,
      phone,
      address,
      avatar_url: avatarUrl,
    };

    const result = await signUp(email, password, metadata);
    if (result.error) {
      setError(result.error);
    } else {
      setSuccess(true);
    }
    setIsLoading(false);
  };

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-950 px-4 relative overflow-hidden font-sans">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(120,119,198,0.2),rgba(255,255,255,0))]" />
        <div className="max-w-md w-full text-center relative z-10 p-8 rounded-3xl bg-gray-900/60 backdrop-blur-xl border border-gray-800 shadow-2xl">
          <div className="mx-auto w-20 h-20 bg-green-950/50 text-green-400 rounded-full flex items-center justify-center mb-6 border border-green-500/30 shadow-[0_0_20px_rgba(34,197,94,0.2)] animate-pulse">
            <CheckCircle2 size={40} />
          </div>
          <h2 className="text-3xl font-extrabold text-white mb-4 tracking-tight">System Initialized</h2>
          <p className="text-gray-400 mb-8 leading-relaxed">
            Your Scolara student profile is successfully loaded. Please verify your email to authenticate and launch the OS.
          </p>
          <Link to="/auth/login">
            <Button className="w-full h-12 text-lg bg-gradient-to-r from-primary to-accent hover:opacity-90 shadow-lg shadow-primary/20">Go to Sign In</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex bg-gray-950 font-sans text-gray-100 relative overflow-hidden">
      {/* Visual background grids */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#0f172a_1px,transparent_1px),linear-gradient(to_bottom,#0f172a_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-35 pointer-events-none" />

      {/* Left Form Section */}
      <div className="flex-1 flex flex-col px-4 sm:px-6 lg:px-20 xl:px-24 py-12 overflow-y-auto z-10">
        <Link to="/" className="inline-flex items-center text-sm font-medium text-gray-500 hover:text-white mb-8 transition-colors w-fit group">
          <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
          Go Back
        </Link>

        <div className="max-w-2xl w-full mx-auto">
          <div className="flex items-center gap-2 mb-10">
            <div className="w-10 h-10 bg-gradient-to-br from-primary to-accent text-white rounded-xl flex items-center justify-center font-bold text-xl shadow-lg shadow-primary/30">
              S
            </div>
            <span className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
              Scolara <span className="text-xs bg-primary/20 text-primary border border-primary/30 px-2 py-0.5 rounded-full font-mono">v1.0-prod</span>
            </span>
          </div>

          <h2 className="text-4xl font-extrabold text-white mb-2 tracking-tight">Create your account</h2>
          <p className="text-gray-400 mb-8 flex items-center gap-2">
            <Sparkles className="text-primary w-4 h-4" /> Join the smartest academic platform in Nigeria.
          </p>

          {error && (
            <div className="p-4 mb-6 bg-red-950/40 text-red-400 rounded-xl text-sm border border-red-500/20 shadow-[0_0_15px_rgba(239,68,68,0.1)]">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Profile Picture Upload with futuristic preview */}
            <div className="flex items-center gap-6 p-4 rounded-2xl bg-gray-900/40 border border-gray-800/80">
              <div 
                onClick={triggerFileSelect}
                className="w-20 h-20 rounded-full bg-gray-900 border-2 border-dashed border-gray-800 hover:border-primary/50 flex items-center justify-center overflow-hidden cursor-pointer relative group transition-all"
              >
                {avatarPreview ? (
                  <img src={avatarPreview} alt="Avatar Preview" className="w-full h-full object-cover" />
                ) : (
                  <User className="w-8 h-8 text-gray-500 group-hover:text-primary transition-colors" />
                )}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                  <Upload className="w-5 h-5 text-white" />
                </div>
              </div>
              <div>
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  onChange={handleFileChange} 
                  accept="image/*" 
                  className="hidden" 
                />
                <Button type="button" variant="outline" size="sm" onClick={triggerFileSelect}>
                  Upload Avatar
                </Button>
                <p className="text-xs text-gray-500 mt-2">Optional. PNG/JPG, max 2MB.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <Input label="First Name" required placeholder="John" value={firstName} onChange={(e) => setFirstName(e.target.value)} />
              <Input label="Middle Name (Optional)" placeholder="Chinedu" value={middleName} onChange={(e) => setMiddleName(e.target.value)} />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <Input label="Preferred Username" required placeholder="johndoe99" value={username} onChange={(e) => setUsername(e.target.value)} />
              <Input label="Matric Number" required placeholder="18/ENG04/042" value={matricNumber} onChange={(e) => setMatricNumber(e.target.value)} />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <Input label="Date of Birth" type="date" required value={dob} onChange={(e) => setDob(e.target.value)} />
              <Select
                label="Gender"
                required
                value={gender}
                onChange={(e) => setGender(e.target.value)}
                options={[
                  { value: '', label: 'Select Gender' },
                  { value: 'male', label: 'Male' },
                  { value: 'female', label: 'Female' },
                  { value: 'other', label: 'Other' },
                  { value: 'prefer_not', label: 'Prefer not to say' }
                ]}
              />
            </div>

            <div className="space-y-6 pt-6 border-t border-gray-900">
              <h3 className="text-lg font-semibold text-white tracking-tight flex items-center gap-2">
                <span className="w-1.5 h-6 bg-primary rounded-full" /> Academic Details
              </h3>

              <Select
                label={isLoadingUnis ? "Loading Universities..." : "University"}
                required
                disabled={isLoadingUnis}
                value={uniId}
                onChange={(e) => {
                  setUniId(e.target.value);
                  setFacultyId('');
                  setDepartment('');
                }}
                options={[
                  { value: '', label: isLoadingUnis ? 'Fetching list...' : 'Select University' },
                  ...universities.map(u => ({ value: u.id, label: u.name }))
                ]}
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <Select
                  label="Faculty"
                  required
                  disabled={!uniId}
                  value={facultyId}
                  onChange={(e) => {
                    setFacultyId(e.target.value);
                    setDepartment('');
                  }}
                  options={[
                    { value: '', label: 'Select Faculty' },
                    ...(selectedUni?.faculties.map(f => ({ value: f.id, label: f.name })) || [])
                  ]}
                />

                <Select
                  label="Department"
                  required
                  disabled={!facultyId}
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  options={[
                    { value: '', label: 'Select Department' },
                    ...(selectedFaculty?.departments.map(d => ({ value: d, label: d })) || [])
                  ]}
                />
              </div>
            </div>

            <div className="space-y-6 pt-6 border-t border-gray-900">
              <h3 className="text-lg font-semibold text-white tracking-tight flex items-center gap-2">
                <span className="w-1.5 h-6 bg-accent rounded-full" /> Security & Contact
              </h3>

              <Input label="Phone Number" type="tel" required placeholder="+234 800 000 0000" value={phone} onChange={(e) => setPhone(e.target.value)} />
              <Input label="Residential Address" required placeholder="Block 4, Room 12, Hall of Residence" value={address} onChange={(e) => setAddress(e.target.value)} />

              <Input label="Email Address" type="email" required placeholder="john@example.com" value={email} onChange={(e) => setEmail(e.target.value)} />
              <Input label="Password" type="password" required placeholder="Min. 6 characters" value={password} onChange={(e) => setPassword(e.target.value)} />
            </div>

            <Button type="submit" className="w-full h-12 text-lg mt-8 bg-gradient-to-r from-primary to-accent hover:opacity-90 shadow-lg shadow-primary/20" isLoading={isLoading}>
              Create Student Account
            </Button>

            <p className="text-center text-sm text-gray-500">
              Already have an account?{' '}
              <Link to="/auth/login" className="font-semibold text-primary hover:text-accent transition-colors">
                Sign in
              </Link>
            </p>
          </form>
        </div>
      </div>

      {/* Right Cyber Image Section */}
      <div className="hidden lg:block relative w-0 flex-1">
        <img
          className="absolute inset-0 h-full w-full object-cover filter brightness-75 contrast-125"
          src="https://images.unsplash.com/photo-1523240795612-9a054b0db644?ixlib=rb-4.0.3&auto=format&fit=crop&w=1740&q=80"
          alt="Students studying together"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-gray-950 via-gray-950/40 to-transparent flex items-end p-16">
          <div className="text-white max-w-lg relative z-10">
            <div className="w-12 h-1.5 bg-gradient-to-r from-primary to-accent mb-6 rounded-full" />
            <h2 className="text-4xl font-extrabold mb-4 tracking-tight leading-tight">Your Academic Operating System.</h2>
            <p className="text-lg text-gray-300 font-light leading-relaxed">Join a community of high-achieving students taking control of their education with AI-powered insights.</p>
          </div>
          <div className="absolute inset-0 bg-blue-950/10 mix-blend-overlay pointer-events-none" />
        </div>
      </div>
    </div>
  );
};
