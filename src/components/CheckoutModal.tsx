import React, { useState } from "react";
import { X, CreditCard, DollarSign, QrCode, Clipboard, CheckCircle2, ShieldCheck } from "lucide-react";
import { CartItem, OrderItem } from "../types";
import { motion, AnimatePresence } from "motion/react";

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  cartItems: CartItem[];
  cartTotal: number;
  user: { email: string; name: string; id: string } | null;
  onOrderSuccess: (orderId: string) => void;
  clearCart: () => void;
}

export default function CheckoutModal({
  isOpen,
  onClose,
  cartItems,
  cartTotal,
  user,
  onOrderSuccess,
  clearCart,
}: CheckoutModalProps) {
  const [paymentMethod, setPaymentMethod] = useState<"card" | "pix">("card");
  const [cardHolder, setCardHolder] = useState("");
  const [cardNumber, setCardNumber] = useState("");
  const [cardExpiry, setCardExpiry] = useState("");
  const [cardCvv, setCardCvv] = useState("");
  const [installments, setInstallments] = useState("1");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [orderId, setOrderId] = useState("");
  const [copiedPix, setCopiedPix] = useState(false);

  const pixKey = "00020126580014br.gov.bcb.pix0136canalvisual-weg-pix-key-2026-mercadopago5204000053039865405" + cartTotal.toFixed(2) + "5802BR5912Canal Visual6009SÃO PAULO62070503***6304A1B2";

  const handleCopyPix = () => {
    navigator.clipboard.writeText(pixKey);
    setCopiedPix(true);
    setTimeout(() => setCopiedPix(false), 2000);
  };

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    if (cartItems.length === 0) return;

    setIsSubmitting(true);

    const orderItems: OrderItem[] = cartItems.map((item) => ({
      productId: item.productId,
      name: item.name,
      color: item.colorName || undefined,
      price: item.price,
      quantity: item.quantity,
    }));

    const orderPayload = {
      userId: user?.id || "anonymous",
      userEmail: user?.email || "anonimo@canalvisual.com.br",
      userName: user?.name || "Cliente Visitante",
      items: orderItems,
      total: cartTotal,
      status: paymentMethod === "pix" ? "Aguardando PIX" : "Aprovado",
      paymentMethod: paymentMethod === "pix" ? "Mercado Pago (PIX)" : "Mercado Pago (Cartão)",
    };

    try {
      const response = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(orderPayload),
      });

      if (response.ok) {
        const createdOrder = await response.json();
        setOrderId(createdOrder.id);
        setIsSuccess(true);
        clearCart();
        onOrderSuccess(createdOrder.id);
      } else {
        alert("Erro ao processar pedido. Tente novamente.");
      }
    } catch (err) {
      console.error(err);
      alert("Erro ao conectar com o servidor.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs font-sans">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-white rounded-3xl w-full max-w-xl shadow-2xl overflow-hidden border border-gray-100 flex flex-col max-h-[90vh]"
          >
            {/* Header */}
            <div className="p-6 bg-gray-50 border-b border-gray-100 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-gray-800">Finalizar Compra</h3>
                <p className="text-xs text-gray-500">Checkout Seguro via Mercado Pago</p>
              </div>
              <button onClick={onClose} className="text-gray-400 hover:text-gray-600 p-2 rounded-full hover:bg-gray-200 transition-colors">
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Scrollable Body */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {!isSuccess ? (
                <form onSubmit={handleCheckout} className="space-y-6">
                  {/* Order Summary */}
                  <div className="bg-blue-50/50 p-4 rounded-2xl border border-blue-100/50 space-y-3">
                    <h4 className="text-xs font-bold text-[#005792] uppercase tracking-wider">Resumo do Pedido</h4>
                    <div className="divide-y divide-blue-100/30 max-h-32 overflow-y-auto pr-1">
                      {cartItems.map((item, idx) => (
                        <div key={idx} className="py-2 flex items-center justify-between text-sm text-gray-700">
                          <div>
                            <span className="font-semibold">{item.quantity}x</span> {item.name}
                            {item.colorName && (
                              <span className="block text-xs text-gray-500 font-normal">Cor: {item.colorName}</span>
                            )}
                          </div>
                          <span className="font-medium text-gray-800">R$ {(item.price * item.quantity).toFixed(2)}</span>
                        </div>
                      ))}
                    </div>
                    <div className="pt-2 border-t border-blue-100 flex justify-between items-center text-[#005792]">
                      <span className="font-bold text-sm">Total do Pedido</span>
                      <span className="font-extrabold text-lg">R$ {cartTotal.toFixed(2)}</span>
                    </div>
                  </div>

                  {/* Payment Methods Selector */}
                  <div className="space-y-3">
                    <label className="text-sm font-semibold text-gray-700 block">Forma de Pagamento</label>
                    <div className="grid grid-cols-2 gap-4">
                      <button
                        type="button"
                        onClick={() => setPaymentMethod("card")}
                        className={`p-4 rounded-2xl border-2 flex flex-col items-center gap-2 transition-all ${paymentMethod === "card" ? "border-[#005792] bg-blue-50/30 text-[#005792]" : "border-gray-200 text-gray-600 hover:border-gray-300"}`}
                      >
                        <CreditCard className="h-6 w-6" />
                        <span className="text-xs font-bold">Cartão de Crédito</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setPaymentMethod("pix")}
                        className={`p-4 rounded-2xl border-2 flex flex-col items-center gap-2 transition-all ${paymentMethod === "pix" ? "border-[#005792] bg-blue-50/30 text-[#005792]" : "border-gray-200 text-gray-600 hover:border-gray-300"}`}
                      >
                        <QrCode className="h-6 w-6" />
                        <span className="text-xs font-bold">PIX Instantâneo</span>
                      </button>
                    </div>
                  </div>

                  {paymentMethod === "card" ? (
                    /* Credit Card Form */
                    <div className="space-y-4 animate-fadeIn">
                      <div className="space-y-1">
                        <label className="text-xs font-semibold text-gray-600">Nome impresso no cartão</label>
                        <input
                          id="input-cardholder"
                          type="text"
                          required
                          placeholder="JOSÉ SILVA SOUZA"
                          value={cardHolder}
                          onChange={(e) => setCardHolder(e.target.value.toUpperCase())}
                          className="w-full text-sm border border-gray-200 rounded-xl px-4 py-2.5 focus:outline-none focus:border-[#005792]"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-xs font-semibold text-gray-600">Número do cartão</label>
                        <input
                          id="input-cardnumber"
                          type="text"
                          required
                          maxLength={19}
                          placeholder="0000 0000 0000 0000"
                          value={cardNumber}
                          onChange={(e) => {
                            const val = e.target.value.replace(/\D/g, "").replace(/(\d{4})/g, "$1 ").trim();
                            setCardNumber(val);
                          }}
                          className="w-full text-sm border border-gray-200 rounded-xl px-4 py-2.5 focus:outline-none focus:border-[#005792]"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <label className="text-xs font-semibold text-gray-600">Validade</label>
                          <input
                            id="input-expiry"
                            type="text"
                            required
                            maxLength={5}
                            placeholder="MM/AA"
                            value={cardExpiry}
                            onChange={(e) => {
                              const val = e.target.value.replace(/\D/g, "").replace(/(\d{2})(\d{1,2})/, "$1/$2");
                              setCardExpiry(val);
                            }}
                            className="w-full text-sm border border-gray-200 rounded-xl px-4 py-2.5 focus:outline-none focus:border-[#005792]"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-xs font-semibold text-gray-600">CVV</label>
                          <input
                            id="input-cvv"
                            type="password"
                            required
                            maxLength={4}
                            placeholder="123"
                            value={cardCvv}
                            onChange={(e) => setCardCvv(e.target.value.replace(/\D/g, ""))}
                            className="w-full text-sm border border-gray-200 rounded-xl px-4 py-2.5 focus:outline-none focus:border-[#005792]"
                          />
                        </div>
                      </div>

                      <div className="space-y-1">
                        <label className="text-xs font-semibold text-gray-600">Parcelas</label>
                        <select
                          id="select-installments"
                          value={installments}
                          onChange={(e) => setInstallments(e.target.value)}
                          className="w-full text-sm border border-gray-200 rounded-xl px-4 py-2.5 focus:outline-none focus:border-[#005792] bg-white"
                        >
                          <option value="1">1x de R$ {cartTotal.toFixed(2)} (Sem juros)</option>
                          <option value="2">2x de R$ {(cartTotal / 2).toFixed(2)} (Sem juros)</option>
                          <option value="3">3x de R$ {(cartTotal / 3).toFixed(2)} (Sem juros)</option>
                          <option value="6">6x de R$ {(cartTotal * 1.05 / 6).toFixed(2)} (Com juros)</option>
                        </select>
                      </div>
                    </div>
                  ) : (
                    /* PIX Information */
                    <div className="p-4 bg-gray-50 rounded-2xl border border-gray-200 flex flex-col items-center gap-4 text-center animate-fadeIn">
                      <div className="bg-white p-3 rounded-2xl border border-gray-100 shadow-xs">
                        {/* Static placeholder for simulated PIX QR Code */}
                        <div className="h-36 w-36 bg-gray-200 flex items-center justify-center rounded-lg relative overflow-hidden">
                          <div className="absolute inset-2 bg-slate-900 flex flex-wrap gap-1 p-2 justify-center items-center rounded">
                            <div className="w-6 h-6 bg-white"></div>
                            <div className="w-6 h-6 bg-white"></div>
                            <div className="w-6 h-6 bg-white"></div>
                            <div className="w-6 h-6 bg-white"></div>
                            <div className="w-6 h-6 bg-white"></div>
                            <div className="w-6 h-6 bg-white"></div>
                            <div className="w-10 h-10 bg-[#005792] rounded-full border border-white flex items-center justify-center text-white text-[8px] font-bold">WEG</div>
                          </div>
                        </div>
                      </div>
                      <div>
                        <p className="text-sm font-bold text-gray-800">Escaneie o QR Code acima</p>
                        <p className="text-xs text-gray-500 mt-1 max-w-sm">
                          O pagamento é processado instantaneamente pelo Mercado Pago. Copie o código 'Copia e Cola' abaixo se preferir pagar no app do banco.
                        </p>
                      </div>

                      <div className="w-full flex items-center gap-2 bg-white border border-gray-200 rounded-xl p-2 pl-4">
                        <span className="text-xs text-gray-400 font-mono truncate flex-1 text-left">{pixKey}</span>
                        <button
                          type="button"
                          onClick={handleCopyPix}
                          className="bg-[#005792] hover:bg-[#004370] text-white px-3 py-1.5 rounded-lg text-xs flex items-center gap-1.5 transition-colors shrink-0"
                        >
                          <Clipboard className="h-3.5 w-3.5" />
                          {copiedPix ? "Copiado!" : "Copiar"}
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Submit Button */}
                  <div className="pt-4 border-t border-gray-100 space-y-3">
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full bg-[#005792] hover:bg-[#004370] text-white font-bold py-3 px-6 rounded-2xl shadow-lg shadow-blue-950/20 hover:shadow-blue-950/30 transition-all flex items-center justify-center gap-2 disabled:bg-gray-400 disabled:shadow-none"
                    >
                      {isSubmitting ? "Processando..." : `Pagar R$ ${cartTotal.toFixed(2)}`}
                    </button>
                    <div className="flex items-center justify-center gap-1.5 text-xs text-gray-400 font-medium">
                      <ShieldCheck className="h-4 w-4 text-[#005792]" /> Transação segura garantida por Mercado Pago SSL.
                    </div>
                  </div>
                </form>
              ) : (
                /* Success Screen */
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="py-8 text-center space-y-4 flex flex-col items-center"
                >
                  <CheckCircle2 className="h-16 w-16 text-blue-500 animate-bounce" />
                  <div>
                    <h4 className="text-xl font-bold text-gray-800">Pedido Confirmado!</h4>
                    <p className="text-sm text-gray-500 mt-1">
                      {paymentMethod === "pix"
                        ? "Aguardando confirmação do pagamento via PIX."
                        : "Seu pagamento foi aprovado com sucesso."}
                     </p>
                  </div>

                  <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100 space-y-1.5 text-sm w-full max-w-sm">
                    <div className="flex justify-between text-gray-600">
                      <span>ID do Pedido:</span>
                      <span className="font-bold text-gray-800">{orderId}</span>
                    </div>
                    <div className="flex justify-between text-gray-600">
                      <span>Status:</span>
                      <span className="font-bold text-blue-700">
                        {paymentMethod === "pix" ? "Aguardando Pagamento" : "Aprovado / Pronto p/ Envio"}
                      </span>
                    </div>
                    <div className="flex justify-between text-gray-600">
                      <span>Valor Pago:</span>
                      <span className="font-bold text-[#005792]">R$ {cartTotal.toFixed(2)}</span>
                    </div>
                  </div>

                  <p className="text-xs text-gray-400 max-w-xs leading-relaxed">
                    Um e-mail de confirmação foi simulado para <span className="font-semibold">{user?.email || "anonimo@canalvisual.com.br"}</span> com o código de rastreamento do envio WEG.
                  </p>

                  <button
                    onClick={onClose}
                    className="bg-[#005792] hover:bg-[#004370] text-white px-8 py-2.5 rounded-xl text-sm font-bold transition-colors shadow-md"
                  >
                    Voltar à Loja
                  </button>
                </motion.div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
