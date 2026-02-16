import React from 'react';
import { X, AlertTriangle, CheckCircle, Info, XCircle } from 'lucide-react';

const theme = {
  primary: '#5A7C43',
  primaryDark: '#3D5A2C',
  secondary: '#C8E6C9',
  accent: '#9DC88D',
  background: '#F5F9F3',
  card: '#FFFFFF',
  text: '#2D3E1F',
  textLight: '#5A7C43',
  border: '#D4E9D7',
  hover: '#E8F5E9',
  success: '#81C784',
  warning: '#FFB74D',
  danger: '#E57373'
};

export const Modal = ({ children, onClose, title, large }) => (
  <div 
    onClick={onClose} 
    style={{ 
      position: 'fixed', 
      top: 0, 
      left: 0, 
      right: 0, 
      bottom: 0, 
      backgroundColor: 'rgba(0,0,0,0.5)', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center', 
      zIndex: 1000, 
      padding: '1rem',
      backdropFilter: 'blur(2px)'
    }}
  >
    <div 
      onClick={e => e.stopPropagation()} 
      style={{ 
        backgroundColor: theme.card, 
        borderRadius: '16px', 
        maxWidth: large ? '1000px' : '600px', 
        width: '100%', 
        maxHeight: '90vh', 
        overflowY: 'auto', 
        boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
        animation: 'slideIn 0.3s ease-out'
      }}
    >
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        padding: '1.5rem', 
        borderBottom: `2px solid ${theme.border}`, 
        position: 'sticky', 
        top: 0, 
        backgroundColor: theme.card, 
        zIndex: 10,
        borderRadius: '16px 16px 0 0'
      }}>
        <h3 style={{ fontSize: '1.3rem', fontWeight: '700', color: theme.text, margin: 0 }}>
          {title}
        </h3>
        <button 
          onClick={onClose} 
          style={{ 
            background: theme.hover, 
            border: 'none', 
            borderRadius: '8px', 
            padding: '0.5rem', 
            cursor: 'pointer',
            transition: 'all 0.2s'
          }}
          onMouseEnter={e => e.currentTarget.style.backgroundColor = theme.secondary}
          onMouseLeave={e => e.currentTarget.style.backgroundColor = theme.hover}
        >
          <X size={20} color={theme.text} />
        </button>
      </div>
      <div style={{ padding: '1.5rem' }}>{children}</div>
    </div>
  </div>
);

export const Alert = ({ children, type = 'info', style }) => {
  const types = {
    success: { bg: '#E8F5E9', border: theme.success, icon: CheckCircle },
    error: { bg: '#FFEBEE', border: theme.danger, icon: XCircle },
    warning: { bg: '#FFF9E6', border: theme.warning, icon: AlertTriangle },
    info: { bg: '#E3F2FD', border: '#2196F3', icon: Info }
  };
  
  const { bg, border, icon: Icon } = types[type] || types.info;
  
  return (
    <div style={{ 
      padding: '1rem', 
      borderRadius: '12px', 
      backgroundColor: bg, 
      border: `2px solid ${border}`,
      display: 'flex',
      alignItems: 'start',
      gap: '0.75rem',
      animation: 'slideIn 0.3s ease-out',
      ...style 
    }}>
      <Icon size={20} color={border} style={{ flexShrink: 0, marginTop: '2px' }} />
      <div style={{ flex: 1 }}>{children}</div>
    </div>
  );
};

export const AlertDescription = ({ children, style }) => (
  <div style={{ color: theme.text, fontSize: '0.95rem', lineHeight: '1.5', ...style }}>
    {children}
  </div>
);

export const Button = ({ 
  children, 
  onClick, 
  variant = 'primary', 
  size = 'md', 
  disabled = false,
  icon: Icon,
  fullWidth = false,
  style 
}) => {
  const variants = {
    primary: {
      background: `linear-gradient(135deg, ${theme.primary}, ${theme.accent})`,
      color: 'white',
      border: 'none',
      shadow: '0 4px 12px rgba(90,124,67,0.3)'
    },
    secondary: {
      background: theme.secondary,
      color: theme.text,
      border: `2px solid ${theme.border}`,
      shadow: 'none'
    },
    danger: {
      background: '#FFEBEE',
      color: theme.danger,
      border: `2px solid ${theme.danger}`,
      shadow: 'none'
    },
    outline: {
      background: 'white',
      color: theme.text,
      border: `2px solid ${theme.border}`,
      shadow: 'none'
    }
  };
  
  const sizes = {
    sm: { padding: '0.5rem 1rem', fontSize: '0.875rem' },
    md: { padding: '0.875rem 1.5rem', fontSize: '0.95rem' },
    lg: { padding: '1rem 2rem', fontSize: '1rem' }
  };
  
  const variantStyle = variants[variant] || variants.primary;
  const sizeStyle = sizes[size] || sizes.md;
  
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        ...variantStyle,
        ...sizeStyle,
        borderRadius: '12px',
        fontWeight: '600',
        cursor: disabled ? 'not-allowed' : 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '0.5rem',
        transition: 'all 0.2s',
        opacity: disabled ? 0.5 : 1,
        width: fullWidth ? '100%' : 'auto',
        boxShadow: variantStyle.shadow,
        ...style
      }}
      onMouseEnter={e => {
        if (!disabled && variant === 'primary') {
          e.currentTarget.style.transform = 'translateY(-2px)';
          e.currentTarget.style.boxShadow = '0 6px 16px rgba(90,124,67,0.4)';
        }
      }}
      onMouseLeave={e => {
        if (!disabled && variant === 'primary') {
          e.currentTarget.style.transform = 'translateY(0)';
          e.currentTarget.style.boxShadow = variantStyle.shadow;
        }
      }}
    >
      {Icon && <Icon size={18} />}
      {children}
    </button>
  );
};

export const Card = ({ children, style, onClick }) => (
  <div 
    onClick={onClick}
    style={{ 
      backgroundColor: theme.card, 
      borderRadius: '16px', 
      padding: '1.5rem', 
      border: `2px solid ${theme.border}`, 
      boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
      transition: 'all 0.2s',
      cursor: onClick ? 'pointer' : 'default',
      ...style 
    }}
    onMouseEnter={e => {
      if (onClick) {
        e.currentTarget.style.transform = 'translateY(-4px)';
        e.currentTarget.style.boxShadow = '0 8px 24px rgba(90,124,67,0.15)';
      }
    }}
    onMouseLeave={e => {
      if (onClick) {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.04)';
      }
    }}
  >
    {children}
  </div>
);

export const Input = ({ label, error, helperText, required, ...props }) => (
  <div style={{ width: '100%' }}>
    {label && (
      <label style={{ 
        display: 'block', 
        marginBottom: '0.5rem', 
        fontWeight: '500', 
        color: theme.text,
        fontSize: '0.95rem'
      }}>
        {label} {required && <span style={{ color: theme.danger }}>*</span>}
      </label>
    )}
    <input
      {...props}
      style={{
        width: '100%',
        padding: '0.75rem',
        borderRadius: '8px',
        border: `2px solid ${error ? theme.danger : theme.border}`,
        fontSize: '0.95rem',
        transition: 'all 0.2s',
        outline: 'none',
        ...props.style
      }}
      onFocus={e => {
        if (!error) e.currentTarget.style.borderColor = theme.primary;
      }}
      onBlur={e => {
        if (!error) e.currentTarget.style.borderColor = theme.border;
      }}
    />
    {error && (
      <div style={{ 
        marginTop: '0.25rem', 
        fontSize: '0.875rem', 
        color: theme.danger 
      }}>
        {error}
      </div>
    )}
    {helperText && !error && (
      <div style={{ 
        marginTop: '0.25rem', 
        fontSize: '0.875rem', 
        color: theme.textLight 
      }}>
        {helperText}
      </div>
    )}
  </div>
);

export const Select = ({ label, error, required, children, ...props }) => (
  <div style={{ width: '100%' }}>
    {label && (
      <label style={{ 
        display: 'block', 
        marginBottom: '0.5rem', 
        fontWeight: '500', 
        color: theme.text,
        fontSize: '0.95rem'
      }}>
        {label} {required && <span style={{ color: theme.danger }}>*</span>}
      </label>
    )}
    <select
      {...props}
      style={{
        width: '100%',
        padding: '0.75rem',
        borderRadius: '8px',
        border: `2px solid ${error ? theme.danger : theme.border}`,
        fontSize: '0.95rem',
        backgroundColor: 'white',
        cursor: 'pointer',
        outline: 'none',
        ...props.style
      }}
      onFocus={e => {
        if (!error) e.currentTarget.style.borderColor = theme.primary;
      }}
      onBlur={e => {
        if (!error) e.currentTarget.style.borderColor = theme.border;
      }}
    >
      {children}
    </select>
    {error && (
      <div style={{ 
        marginTop: '0.25rem', 
        fontSize: '0.875rem', 
        color: theme.danger 
      }}>
        {error}
      </div>
    )}
  </div>
);

export const Badge = ({ children, variant = 'default' }) => {
  const variants = {
    default: { bg: theme.secondary, color: theme.text },
    success: { bg: '#E8F5E9', color: theme.success },
    warning: { bg: '#FFF9E6', color: theme.warning },
    danger: { bg: '#FFEBEE', color: theme.danger },
    info: { bg: '#E3F2FD', color: '#2196F3' }
  };
  
  const style = variants[variant] || variants.default;
  
  return (
    <span style={{
      display: 'inline-block',
      padding: '0.25rem 0.75rem',
      borderRadius: '12px',
      fontSize: '0.875rem',
      fontWeight: '500',
      backgroundColor: style.bg,
      color: style.color
    }}>
      {children}
    </span>
  );
};
