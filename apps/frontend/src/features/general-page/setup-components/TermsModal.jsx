import React from 'react';
import { useTranslation } from 'react-i18next';

const TermsModal = ({ 
    show, 
    onClose, 
    onAccept, 
    modalCheckboxChecked, 
    setModalCheckboxChecked, 
    hasScrolledToBottom, 
    handleScrollTerms 
}) => {
    const { t } = useTranslation();
    if (!show) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-3xl flex flex-col max-h-[85vh] animate-in zoom-in-95 duration-200">
                {/* Modal Header */}
                <div className="px-8 pt-8 pb-4 border-b border-gray-100">
                    <h2 className="text-[22px] font-bold text-[#009b7c] mb-1">{t('auth.terms.title').toUpperCase()}</h2>
                    <h3 className="text-[15px] font-bold text-[#111827]">{t('auth.terms.subtitle')}</h3>
                </div>

                {/* Modal Body / Scrollable */}
                <div
                    onScroll={handleScrollTerms}
                    className="px-8 py-5 overflow-y-auto flex-1 custom-scrollbar text-[13.5px] text-gray-600 leading-relaxed pr-6"
                >
                    <p className="mb-6 text-[#009b7c] font-semibold">{t('auth.terms.date_text')}</p>
                    
                    <h4 className="font-bold text-gray-800 mb-1 mt-6">{t('auth.terms.sections.introduction.title')}</h4>
                    <p className="mb-4">{t('auth.terms.sections.introduction.content_p1')}</p>
                    <p className="mb-4">{t('auth.terms.sections.introduction.content_p2')}</p>

                    <h4 className="font-bold text-gray-800 mb-2 mt-6">{t('auth.terms.sections.eligibility.title')}</h4>
                    <ul className="list-disc pl-5 mb-4 space-y-2">
                        <li><strong>BIEON:</strong> {t('auth.terms.sections.eligibility.content_li1')}</li>
                        <li><strong>{t('auth.terms.sections.eligibility.content_li2_bold')}</strong> {t('auth.terms.sections.eligibility.content_li2_text')}</li>
                        <li><strong>{t('auth.terms.sections.eligibility.content_li3_bold')}</strong> {t('auth.terms.sections.eligibility.content_li3_text')}</li>
                    </ul>

                    <h4 className="font-bold text-gray-800 mb-2 mt-6">{t('auth.terms.sections.security.title')}</h4>
                    <ol className="list-[lower-alpha] pl-5 mb-4 space-y-2">
                        <li><strong>{t('auth.terms.sections.security.content_li1_bold')}</strong> {t('auth.terms.sections.security.content_li1_text')}</li>
                        <li><strong>{t('auth.terms.sections.security.content_li2_bold')}</strong> {t('auth.terms.sections.security.content_li2_text')}
                            <ul className="list-disc pl-5 mt-2 space-y-1">
                                <li>{t('auth.terms.sections.security.content_li2_sub1')}</li>
                                <li>{t('auth.terms.sections.security.content_li2_sub2')}</li>
                                <li>{t('auth.terms.sections.security.content_li2_sub3')}</li>
                            </ul>
                        </li>
                    </ol>

                    <h4 className="font-bold text-gray-800 mb-2 mt-6">{t('auth.terms.sections.acceptable_use.title')}</h4>
                    <p className="mb-2">{t('auth.terms.sections.acceptable_use.content_intro')}</p>
                    <ul className="list-disc pl-5 mb-4 space-y-2">
                        <li><strong>{t('auth.terms.sections.acceptable_use.content_li1_bold')}</strong> {t('auth.terms.sections.acceptable_use.content_li1_text')}</li>
                        <li><strong>{t('auth.terms.sections.acceptable_use.content_li2_bold')}</strong> {t('auth.terms.sections.acceptable_use.content_li2_text')}</li>
                        <li><strong>{t('auth.terms.sections.acceptable_use.content_li3_bold')}</strong> {t('auth.terms.sections.acceptable_use.content_li3_text')}</li>
                    </ul>

                    <h4 className="font-bold text-gray-800 mb-2 mt-6">{t('auth.terms.sections.reverse_engineering.title')}</h4>
                    <p className="mb-2">{t('auth.terms.sections.reverse_engineering.content_intro')}</p>
                    <ol className="list-[lower-alpha] pl-5 mb-4 space-y-2">
                        <li><strong>{t('auth.terms.sections.reverse_engineering.content_li1_bold')}</strong> {t('auth.terms.sections.reverse_engineering.content_li1_text')}</li>
                        <li><strong>{t('auth.terms.sections.reverse_engineering.content_li2_bold')}</strong> {t('auth.terms.sections.reverse_engineering.content_li2_text')}</li>
                        <li><strong>{t('auth.terms.sections.reverse_engineering.content_li3_bold')}</strong> {t('auth.terms.sections.reverse_engineering.content_li3_text')}</li>
                    </ol>

                    <h4 className="font-bold text-gray-800 mb-2 mt-6">{t('auth.terms.sections.limitation_liability.title')}</h4>
                    <ol className="list-[lower-alpha] pl-5 mb-4 space-y-2">
                        <li>{t('auth.terms.sections.limitation_liability.content_li1')}</li>
                        <li>{t('auth.terms.sections.limitation_liability.content_li2')}</li>
                        <li>{t('auth.terms.sections.limitation_liability.content_li3')}</li>
                    </ol>

                    <h4 className="font-bold text-gray-800 mb-2 mt-6">{t('auth.terms.sections.severability.title')}</h4>
                    <p className="mb-4">{t('auth.terms.sections.severability.content')}</p>

                    <h4 className="font-bold text-gray-800 mb-2 mt-6">{t('auth.terms.sections.governing_law.title')}</h4>
                    <ul className="list-disc pl-5 mb-4 space-y-2">
                        <li>{t('auth.terms.sections.governing_law.content_li1')}</li>
                        <li>{t('auth.terms.sections.governing_law.content_li2')}</li>
                        <li>{t('auth.terms.sections.governing_law.content_li3')}</li>
                        <li>{t('auth.terms.sections.governing_law.content_li4')}</li>
                    </ul>

                    <p className="mb-4 pt-16 pb-4 text-center font-medium">{t('auth.terms.end_text')}</p>
                </div>

                {/* Modal Footer */}
                <div className="px-8 py-6 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-4 bg-gray-50/50 rounded-b-xl">
                    <label className="flex items-center gap-3 cursor-pointer group">
                        <input
                            type="checkbox"
                            checked={modalCheckboxChecked}
                            onChange={(e) => setModalCheckboxChecked(e.target.checked)}
                            disabled={!hasScrolledToBottom}
                            className="w-[18px] h-[18px] rounded-sm border-gray-300 text-[#009b7c] focus:ring-[#009b7c] disabled:opacity-50 transition-colors"
                        />
                        <span className={`text-[13px] font-bold transition-colors ${hasScrolledToBottom ? 'text-[#111827] group-hover:text-[#009b7c]' : 'text-gray-400'}`}>
                            {t('auth.terms.btn_confirm')}
                        </span>
                    </label>

                    <div className="flex gap-2 shrink-0 mt-4 sm:mt-0">
                        <button
                            onClick={onClose}
                            className="px-6 py-2.5 text-[#009b7c] font-bold text-[13.5px] bg-transparent hover:bg-[#009b7c]/10 rounded-lg transition-colors"
                        >
                            {t('auth.terms.btn_cancel')}
                        </button>
                        <button
                            disabled={!modalCheckboxChecked || !hasScrolledToBottom}
                            onClick={onAccept}
                            className={`px-8 py-2.5 rounded-lg font-bold text-[13.5px] transition-all ${modalCheckboxChecked && hasScrolledToBottom
                                ? 'bg-[#009b7c] hover:bg-[#008268] text-white shadow-sm'
                                : 'bg-[#009b7c]/40 text-white cursor-not-allowed'
                                }`}
                        >
                            {t('auth.terms.btn_accept')}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TermsModal;
