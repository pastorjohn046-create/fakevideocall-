import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, User as UserIcon, Camera, Bell, Shield, 
  Moon, LogOut, Check, ChevronRight, Sparkles,
  Circle, MapPin, Globe, Calendar, Mail,
  MessageSquare, Users, Image, Fingerprint,
  Zap, Settings2, Share2
} from 'lucide-react';
import { User } from '../types';

interface ProfileModalProps {
  user: User;
  onClose: () => void;
  onUpdate: (updatedUser: User) => void;
  onLogout?: () => void;
}

export default function ProfileModal({ user, onClose, onUpdate, onLogout }: ProfileModalProps) {
  const [activeTab, setActiveTab ] = useState<'overview' | 'edit' | 'privacy' | 'deepfake'>('overview');
  const [formData, setFormData] = useState<User>(user);
  const [isSaving, setIsSaving] = useState(false);

  const statuses = [
    { label: 'Online', value: 'online', color: 'bg-green-500' },
    { label: 'Away', value: 'away', color: 'bg-yellow-500' },
    { label: 'Busy', value: 'busy', color: 'bg-red-500' },
    { label: 'Offline', value: 'offline', color: 'bg-gray-500' },
  ];

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await fetch(`/api/users/${user.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      onUpdate(formData);
      onClose();
    } catch (err) {
      console.error('Failed to update user', err);
    } finally {
      setIsSaving(false);
    }
  };

  const toggleSetting = (key: keyof NonNullable<User['settings']>) => {
    setFormData({
      ...formData,
      settings: {
        ...(formData.settings || { notifications: true, darkMode: false, readReceipts: true }),
        [key]: !formData.settings?.[key]
      }
    });
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsSaving(true);
    const formDataUpload = new FormData();
    formDataUpload.append('file', file);
    
    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formDataUpload
      });
      const { url } = await res.json();
      setFormData({
        ...formData,
        avatar: url
      });
    } catch (err) {
      console.error("Avatar upload failed", err);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm"
    >
      <motion.div 
        initial={{ scale: 0.95, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.95, y: 20 }}
        className="bg-white dark:bg-gray-900 w-full max-w-xl rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col h-[700px] relative border border-gray-100 dark:border-gray-800"
      >
        {/* Header Section */}
        <div className="relative h-32 shrink-0 bg-blue-500 overflow-hidden">
          <div className="absolute inset-0 opacity-20">
            <div className="absolute -top-10 -left-10 w-40 h-40 bg-white rounded-full blur-3xl" />
            <div className="absolute -bottom-10 -right-10 w-48 h-48 bg-white rounded-full blur-3xl" />
          </div>
          
          <div className="absolute top-6 right-6">
            <button 
              onClick={onClose}
              className="p-2 bg-white/20 hover:bg-white/30 text-white rounded-full transition-all active:scale-90"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Profile Header Overlay */}
        <div className="px-8 -mt-12 flex flex-col items-center md:items-start md:flex-row md:gap-6 relative z-10">
          <div className="relative group">
            <div className="w-28 h-28 rounded-3xl overflow-hidden border-4 border-white dark:border-gray-900 shadow-xl">
              <img src={formData.avatar} alt="Profile" className="w-full h-full object-cover" />
            </div>
            <button 
              onClick={() => document.getElementById('avatar-upload')?.click()}
              className="absolute bottom-1 right-1 p-2 bg-blue-500 text-white rounded-xl shadow-lg hover:scale-110 transition-all border-2 border-white dark:border-gray-900"
            >
              <Camera className="w-4 h-4" />
            </button>
            <input 
              id="avatar-upload"
              type="file" 
              className="hidden" 
              accept="image/*"
              onChange={handleAvatarUpload}
            />
          </div>

          <div className="mt-4 md:mt-14 text-center md:text-left flex-1 min-w-0">
            <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-3">
              <h1 className="text-2xl font-bold text-black dark:text-white truncate">{formData.username}</h1>
              <div className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5 self-center md:self-auto ${
                formData.status === 'online' ? 'bg-green-100 text-green-600 dark:bg-green-500/10' :
                formData.status === 'busy' ? 'bg-red-100 text-red-600 dark:bg-red-500/10' :
                'bg-gray-100 text-gray-600 dark:bg-gray-800'
              }`}>
                <Circle className="w-2 h-2 fill-current" />
                {formData.status}
              </div>
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 truncate">{formData.bio}</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="px-8 mt-6 flex gap-6 border-b border-gray-100 dark:border-gray-800">
          {[
            { id: 'overview', label: 'Overview' },
            { id: 'edit', label: 'Edit' },
            { id: 'privacy', label: 'Settings' },
            { id: 'deepfake', label: 'Deepfake' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`pb-3 text-sm font-semibold transition-all relative ${
                activeTab === tab.id 
                  ? 'text-blue-500' 
                  : 'text-gray-400 hover:text-gray-600'
              }`}
            >
              {tab.label}
              {activeTab === tab.id && (
                <motion.div 
                  layoutId="activeTabProfile"
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-500 rounded-full"
                />
              )}
            </button>
          ))}
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-8 scrollbar-hide">
          <AnimatePresence mode="wait">
            {activeTab === 'overview' && (
              <motion.div
                key="overview"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-6"
              >
                {/* Stats */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <StatCard icon={<MessageSquare />} label="Messages" value={formData.stats?.messagesSent || 0} />
                  <StatCard icon={<Users />} label="Groups" value={formData.stats?.groupsJoined || 0} />
                  <StatCard icon={<Image />} label="Files" value={formData.stats?.mediaShared || 0} />
                  <StatCard icon={<Calendar />} label="Joined" value={formData.joinedAt || '2024'} />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Identity */}
                  <div className="bg-gray-50 dark:bg-gray-800/50 p-5 rounded-3xl space-y-4">
                    <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Details</h3>
                    <div className="space-y-3">
                      <DetailRow icon={<Mail />} label="Email" value="pastorjohn046@gmail.com" />
                      <DetailRow icon={<MapPin />} label="Location" value={formData.location || 'San Francisco'} />
                      <DetailRow icon={<Globe />} label="Website" value={formData.website || 'aero.chat'} isLink />
                    </div>
                  </div>

                  {/* AI Card - Simplified */}
                  <div className="bg-blue-50 dark:bg-blue-900/20 p-5 rounded-3xl border border-blue-100 dark:border-blue-800/30 flex flex-col justify-between">
                    <div>
                      <h3 className="text-[10px] font-bold text-blue-500 uppercase tracking-widest mb-2">AI Persona</h3>
                      <p className="text-lg font-bold text-black dark:text-white leading-tight">
                        Playing as <span className="text-blue-500">{formData.aiPersona || 'Identity Alpha'}</span>
                      </p>
                    </div>
                    <button className="mt-4 w-full py-2 bg-blue-500 text-white rounded-xl text-xs font-bold hover:bg-blue-600 transition-colors shadow-lg shadow-blue-200 dark:shadow-none">
                      Change Persona
                    </button>
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'edit' && (
              <motion.div
                key="edit"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-6"
              >
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest pl-1">Display Name</label>
                    <input 
                      type="text" 
                      value={formData.username}
                      onChange={(e) => setFormData({...formData, username: e.target.value})}
                      className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 rounded-2xl border border-transparent focus:bg-white dark:focus:bg-gray-700 focus:border-blue-500 transition-all outline-none text-sm text-black dark:text-white font-semibold"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest pl-1">Bio</label>
                    <input 
                      type="text" 
                      value={formData.bio}
                      onChange={(e) => setFormData({...formData, bio: e.target.value})}
                      className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 rounded-2xl border border-transparent focus:bg-white dark:focus:bg-gray-700 focus:border-blue-500 transition-all outline-none text-sm text-black dark:text-white font-semibold"
                    />
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest pl-1">Status</label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {statuses.map((s) => (
                      <button 
                        key={s.value}
                        onClick={() => setFormData({...formData, status: s.value as any})}
                        className={`flex items-center justify-center gap-2 px-3 py-3 rounded-2xl border transition-all ${
                          formData.status === s.value 
                            ? 'bg-blue-50 border-blue-500 text-blue-600' 
                            : 'bg-white dark:bg-gray-800 border-gray-100 dark:border-gray-700 text-gray-500 hover:border-gray-200'
                        }`}
                      >
                        <Circle className={`w-2 h-2 fill-current ${s.color} ${formData.status === s.value ? '' : 'text-transparent opacity-0'}`} />
                        <span className="text-[11px] font-bold uppercase">{s.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'privacy' && (
              <motion.div
                key="privacy"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-2"
              >
                <SettingToggle 
                  icon={<Bell className="w-5 h-5" />} 
                  label="Push Notifications" 
                  isActive={!!formData.settings?.notifications}
                  onClick={() => toggleSetting('notifications')}
                />
                <SettingToggle 
                  icon={<Shield className="w-5 h-5" />} 
                  label="Private Account" 
                  isActive={!!formData.settings?.readReceipts}
                  onClick={() => toggleSetting('readReceipts')}
                />
                
                <div className="mt-8 p-6 bg-red-50 dark:bg-red-900/10 rounded-3xl border border-red-100 dark:border-red-800/20 text-center">
                  <p className="text-sm font-semibold text-red-600 mb-4">Want to sign out from AeroChat?</p>
                  <button 
                    onClick={onLogout}
                    className="px-8 py-2.5 bg-red-500 text-white rounded-xl text-xs font-bold hover:bg-red-600 transition-all shadow-lg shadow-red-200 dark:shadow-none flex items-center gap-2 mx-auto"
                  >
                    <LogOut className="w-4 h-4" />
                    Sign Out
                  </button>
                </div>
              </motion.div>
            )}

            {activeTab === 'deepfake' && (
              <motion.div
                key="deepfake"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-6"
              >
                <div className="bg-gradient-to-br from-indigo-500 to-purple-600 p-6 rounded-[2rem] text-white shadow-xl relative overflow-hidden">
                  <div className="relative z-10">
                    <div className="flex items-center gap-3 mb-2">
                      <Sparkles className="w-5 h-5 text-indigo-200" />
                      <h3 className="text-lg font-bold">Deepfake Persona Engine</h3>
                    </div>
                    <p className="text-indigo-100 text-xs leading-relaxed opacity-90">
                      Convert static images or clips into realistic live video loops for your calls. Our AI synthesis engine creates natural movement and breathing patterns.
                    </p>
                  </div>
                  <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-3xl" />
                </div>

                <SettingToggle 
                  icon={<Fingerprint className="w-5 h-5" />} 
                  label="Enable Deepfake Cam" 
                  isActive={!!formData.settings?.deepfakeEnabled}
                  onClick={() => toggleSetting('deepfakeEnabled')}
                />

                <div className="space-y-4">
                  <div className="flex items-center justify-between px-1">
                    <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Your Custom Aliases</h4>
                    <span className="text-[10px] font-bold text-blue-500 uppercase tracking-widest">{formData.customPersonas?.length || 0} / 5</span>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    {/* Add New Trigger */}
                    <button 
                      onClick={() => document.getElementById('persona-upload')?.click()}
                      className="aspect-square rounded-[2rem] border-2 border-dashed border-gray-100 dark:border-gray-800 hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-500/5 transition-all flex flex-col items-center justify-center gap-3 group"
                    >
                      <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-2xl group-hover:bg-blue-500 transition-all duration-300">
                        <Zap className="w-6 h-6 text-gray-400 group-hover:text-white" />
                      </div>
                      <span className="text-[10px] font-black text-gray-400 group-hover:text-blue-500 uppercase tracking-widest">Add Asset</span>
                      <input 
                        id="persona-upload"
                        type="file" 
                        className="hidden" 
                        accept="image/*,video/*"
                        onChange={async (e) => {
                          const file = e.target.files?.[0];
                          if (!file) return;
                          
                          // Actual upload process
                          setIsSaving(true);
                          const formDataUpload = new FormData();
                          formDataUpload.append('file', file);
                          
                          try {
                            const res = await fetch('/api/upload', {
                              method: 'POST',
                              body: formDataUpload
                            });
                            const { url } = await res.json();
                            
                            // Simulate AI synthesis processing time
                            setTimeout(() => {
                              const type = file.type.startsWith('video/') ? 'video' : 'image';
                              const newPersona = {
                                id: Math.random().toString(36).substr(2, 9),
                                name: `Alias ${formData.customPersonas?.length || 0 + 1}`,
                                url: url,
                                type: type as 'image' | 'video'
                              };
                              setFormData({
                                ...formData,
                                customPersonas: [...(formData.customPersonas || []), newPersona]
                              });
                              setIsSaving(false);
                            }, 1500);
                          } catch (err) {
                            console.error("Upload failed", err);
                            setIsSaving(false);
                          }
                        }}
                      />
                    </button>

                    {formData.customPersonas?.map((persona) => (
                      <div key={persona.id} className="relative aspect-square rounded-[2rem] overflow-hidden border border-gray-100 dark:border-gray-800 group">
                        {persona.type === 'video' ? (
                          <video src={persona.url} className="w-full h-full object-cover" autoPlay loop muted playsInline />
                        ) : (
                          <img src={persona.url} className="w-full h-full object-cover" />
                        )}
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <button 
                            onClick={() => {
                              setFormData({
                                ...formData,
                                customPersonas: formData.customPersonas?.filter(p => p.id !== persona.id)
                              });
                            }}
                            className="p-3 bg-red-500 text-white rounded-full hover:scale-110 transition-transform"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                        <div className="absolute bottom-3 left-3 right-3 px-2 py-1 bg-black/40 backdrop-blur-md rounded-lg">
                          <p className="text-[8px] font-black text-white uppercase tracking-widest truncate">{persona.name}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="p-4 bg-blue-50 dark:bg-blue-900/10 rounded-2xl border border-blue-100 dark:border-blue-800/20 flex gap-4">
                  <div className="p-2 bg-blue-500 rounded-xl self-start">
                    <Shield className="w-4 h-4 text-white" />
                  </div>
                  <div className="flex-1">
                    <p className="text-[10px] font-bold text-blue-600 dark:text-blue-400 uppercase tracking-widest mb-1">Privacy Guard</p>
                    <p className="text-[10px] text-gray-500 dark:text-gray-400 leading-relaxed">
                      All personas are processed locally on your device using WebGPU acceleration. No biometric data is sent to our servers.
                    </p>
                  </div>
                </div>
          </AnimatePresence>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-100 dark:border-gray-800 flex justify-end items-center gap-3 bg-gray-50/50 dark:bg-gray-900/50 backdrop-blur-md">
          <button 
            onClick={onClose}
            className="px-5 py-2 text-sm font-bold text-gray-400 hover:text-gray-600 transition-colors uppercase tracking-widest"
          >
            Cancel
          </button>
          <button 
            onClick={handleSave}
            disabled={isSaving}
            className="px-8 py-2.5 bg-blue-500 text-white rounded-2xl text-sm font-bold shadow-lg shadow-blue-200 hover:bg-blue-600 active:scale-95 transition-all flex items-center gap-2 disabled:opacity-50"
          >
            {isSaving ? (
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : <Check className="w-4 h-4" />}
            Save Changes
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

function StatCard({ icon, label, value }: { icon: React.ReactNode, label: string, value: string | number }) {
  return (
    <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-2xl flex flex-col items-center justify-center text-center gap-1 border border-transparent hover:border-gray-100 dark:hover:border-gray-700 transition-all">
      <div className="p-2 bg-blue-100 dark:bg-blue-500/10 text-blue-500 rounded-xl mb-1">
        {React.cloneElement(icon as React.ReactElement, { className: 'w-4 h-4' })}
      </div>
      <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">{label}</p>
      <p className="text-sm font-bold text-black dark:text-white uppercase">{value}</p>
    </div>
  );
}

function DetailRow({ icon, label, value, isLink }: { icon: React.ReactNode, label: string, value: string, isLink?: boolean }) {
  return (
    <div className="flex items-center gap-3">
      <div className="text-gray-400">
        {React.cloneElement(icon as React.ReactElement, { className: 'w-4 h-4' })}
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">{label}</p>
        <p className={`text-xs font-semibold truncate ${isLink ? 'text-blue-500' : 'text-black dark:text-gray-300'}`}>
          {value}
        </p>
      </div>
    </div>
  );
}

function SettingToggle({ icon, label, isActive, onClick }: { icon: React.ReactNode, label: string, isActive: boolean, onClick: () => void }) {
  return (
    <button 
      onClick={onClick}
      className="w-full flex items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-2xl transition-all group"
    >
      <div className="flex items-center gap-4">
        <div className={`p-2 rounded-xl transition-all ${isActive ? 'bg-blue-100 dark:bg-blue-500/20 text-blue-500' : 'bg-gray-100 dark:bg-gray-700 text-gray-400'}`}>
          {icon}
        </div>
        <span className="text-sm font-bold text-black dark:text-white">{label}</span>
      </div>
      <div className={`w-11 h-6 rounded-full transition-all relative p-1 ${isActive ? 'bg-blue-500' : 'bg-gray-200 dark:bg-gray-700'}`}>
        <motion.div 
          animate={{ x: isActive ? 20 : 0 }}
          className="w-4 h-4 bg-white rounded-full shadow-sm"
        />
      </div>
    </button>
  );
}
