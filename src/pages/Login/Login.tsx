import {
  useState,
  type FormEvent,
} from "react";

import {
  HiOutlineEye,
  HiOutlineEyeSlash,
  HiOutlineLockClosed,
  HiOutlineEnvelope,
  HiOutlineShieldCheck,
} from "react-icons/hi2";

import { useNavigate } from "react-router-dom";

import { toast } from "sonner";

import { useAuth } from "../../context/AuthContext";


export default function Login() {

  const { login } = useAuth();

  const navigate = useNavigate();


  const [email, setEmail] =
    useState("");

  const [password, setPassword] =
    useState("");

  const [showPassword, setShowPassword] =
    useState(false);

  const [loading, setLoading] =
    useState(false);


  /*
   * =========================================================
   * LOGIN
   * =========================================================
   */

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {

    event.preventDefault();


    const cleanEmail =
      email.trim();


    /*
     * Basic validation
     */

    if (!cleanEmail) {

      toast.error(
        "Please enter your email address."
      );

      return;
    }


    if (!password) {

      toast.error(
        "Please enter your password."
      );

      return;
    }


    try {

      setLoading(true);


      /*
       * Authenticate user.
       *
       * AuthContext updates the authenticated
       * user state.
       */

      await login(
        cleanEmail,
        password
      );


      /*
       * Authentication succeeded.
       *
       * Send the user to the dashboard.
       *
       * replace: true prevents the login page
       * from remaining in browser history.
       */

      navigate(
        "/dashboard",
        {
          replace: true,
        }
      );


    } catch (error: any) {

      const message =
        error?.response?.data?.message ??
        error?.message ??
        "Unable to sign in. Please check your credentials.";


      toast.error(
        message
      );


    } finally {

      setLoading(false);

    }
  }


  return (

    <main
      className="
                relative
                min-h-screen
                overflow-hidden
                bg-[#020817]
                text-white
            "
    >

      {/* =====================================================
                BACKGROUND
            ===================================================== */}

      <div
        aria-hidden="true"
        className="
                    pointer-events-none
                    absolute
                    inset-0
                    overflow-hidden
                "
      >

        {/* Fine grid */}

        <div
          className="
                        absolute
                        inset-0
                        opacity-[0.045]
                        bg-[linear-gradient(to_right,#64748b_1px,transparent_1px),linear-gradient(to_bottom,#64748b_1px,transparent_1px)]
                        bg-[size:48px_48px]
                    "
        />


        {/* Center glow */}

        <div
          className="
                        absolute
                        left-1/2
                        top-1/2
                        h-[700px]
                        w-[700px]
                        -translate-x-1/2
                        -translate-y-1/2
                        rounded-full
                        bg-blue-600/[0.035]
                        blur-[120px]
                    "
        />


        {/* Top-left glow */}

        <div
          className="
                        absolute
                        -left-40
                        -top-40
                        h-[500px]
                        w-[500px]
                        rounded-full
                        bg-cyan-500/[0.025]
                        blur-[110px]
                    "
        />


        {/* Bottom-right glow */}

        <div
          className="
                        absolute
                        -bottom-40
                        -right-40
                        h-[550px]
                        w-[550px]
                        rounded-full
                        bg-indigo-500/[0.035]
                        blur-[120px]
                    "
        />


        {/* =================================================
                    LEFT DECORATIVE NETWORK
                ================================================= */}

        <div
          className="
                        absolute
                        left-[5%]
                        top-[28%]
                        hidden
                        h-[360px]
                        w-[300px]
                        lg:block
                    "
        >

          {/* Horizontal line */}

          <div
            className="
                            absolute
                            left-0
                            top-16
                            h-px
                            w-44
                            bg-gradient-to-r
                            from-blue-500/30
                            to-transparent
                        "
          />


          {/* Vertical line */}

          <div
            className="
                            absolute
                            left-24
                            top-16
                            h-44
                            w-px
                            bg-gradient-to-b
                            from-blue-500/30
                            to-transparent
                        "
          />


          {/* Node */}

          <span
            className="
                            absolute
                            left-[5.65rem]
                            top-[3.7rem]
                            h-2
                            w-2
                            rounded-full
                            bg-blue-500/60
                            shadow-[0_0_14px_rgba(59,130,246,0.7)]
                        "
          />


          {/* Second horizontal */}

          <div
            className="
                            absolute
                            left-24
                            top-60
                            h-px
                            w-48
                            bg-gradient-to-r
                            from-blue-500/25
                            to-transparent
                        "
          />


          <span
            className="
                            absolute
                            left-[14.5rem]
                            top-[14.75rem]
                            h-1.5
                            w-1.5
                            rounded-full
                            bg-cyan-400/60
                        "
          />


          {/* Document box */}

          <div
            className="
                            absolute
                            left-0
                            top-8
                            flex
                            h-20
                            w-24
                            items-center
                            justify-center
                            rounded-xl
                            border
                            border-blue-400/10
                            bg-slate-900/20
                        "
          >

            <div
              className="
                                h-10
                                w-8
                                rounded-md
                                border
                                border-blue-400/20
                            "
            />

          </div>


          {/* Team node */}

          <div
            className="
                            absolute
                            left-20
                            top-40
                            flex
                            h-20
                            w-24
                            items-center
                            justify-center
                            rounded-xl
                            border
                            border-blue-400/10
                            bg-slate-900/20
                        "
          >

            <div
              className="
                                h-8
                                w-8
                                rounded-full
                                border
                                border-blue-400/20
                            "
            />

          </div>

        </div>


        {/* =================================================
                    RIGHT DECORATIVE NETWORK
                ================================================= */}

        <div
          className="
                        absolute
                        right-[4%]
                        bottom-[18%]
                        hidden
                        h-[330px]
                        w-[300px]
                        lg:block
                    "
        >

          <div
            className="
                            absolute
                            right-0
                            top-16
                            h-px
                            w-48
                            bg-gradient-to-l
                            from-indigo-500/30
                            to-transparent
                        "
          />


          <div
            className="
                            absolute
                            right-24
                            top-16
                            h-44
                            w-px
                            bg-gradient-to-b
                            from-indigo-500/30
                            to-transparent
                        "
          />


          <span
            className="
                            absolute
                            right-[5.9rem]
                            top-[3.7rem]
                            h-2
                            w-2
                            rounded-full
                            bg-indigo-500/60
                            shadow-[0_0_14px_rgba(99,102,241,0.7)]
                        "
          />


          <div
            className="
                            absolute
                            bottom-8
                            right-8
                            h-40
                            w-40
                            rounded-full
                            border
                            border-blue-500/[0.08]
                        "
          />


          <div
            className="
                            absolute
                            bottom-14
                            right-14
                            h-28
                            w-28
                            rounded-full
                            border
                            border-blue-500/[0.08]
                        "
          />


          <div
            className="
                            absolute
                            bottom-20
                            right-20
                            h-16
                            w-16
                            rounded-full
                            border
                            border-blue-500/[0.10]
                        "
          />


          <span
            className="
                            absolute
                            bottom-[4.4rem]
                            right-[4.4rem]
                            h-3
                            w-3
                            rounded-full
                            bg-blue-500/60
                            shadow-[0_0_18px_rgba(59,130,246,0.8)]
                        "
          />

        </div>

      </div>


      {/* =====================================================
                HEADER
            ===================================================== */}

      <header
        className="
                    absolute
                    left-0
                    right-0
                    top-0
                    z-20
                    flex
                    h-20
                    items-center
                    justify-between
                    border-b
                    border-white/[0.06]
                    px-6
                    sm:px-8
                    lg:px-12
                "
      >

        <div
          className="
                        flex
                        items-center
                        gap-3
                    "
        >

          <div
            className="
                            flex
                            h-10
                            w-10
                            items-center
                            justify-center
                            rounded-xl
                            border
                            border-white/10
                            bg-white/[0.04]
                            p-1.5
                        "
          >

            <img
              src="/group.png"
              alt="Team Work"
              className="
                                h-full
                                w-full
                                object-contain
                            "
            />

          </div>


          <div>

            <p
              className="
                                text-sm
                                font-semibold
                                tracking-tight
                            "
            >
              Team Work
            </p>


            <p
              className="
                                text-[10px]
                                uppercase
                                tracking-[0.16em]
                                text-slate-500
                            "
            >
              Reporting System
            </p>

          </div>

        </div>


        <div
          className="
                        hidden
                        items-center
                        gap-3
                        sm:flex
                    "
        >

          <span
            className="
                            h-1.5
                            w-1.5
                            rounded-full
                            bg-emerald-400
                        "
          />


          <span
            className="
                            text-xs
                            text-slate-500
                        "
          >
            Secure application
          </span>

        </div>

      </header>


      {/* =====================================================
                MAIN
            ===================================================== */}

      <section
        className="
                    relative
                    z-10
                    flex
                    min-h-screen
                    items-center
                    justify-center
                    px-4
                    pb-12
                    pt-24
                "
      >

        <div
          className="
                        w-full
                        max-w-[430px]
                    "
        >

          {/* =================================================
                        AUTH LABEL
                    ================================================= */}

          <div
            className="
                            mb-5
                            flex
                            items-center
                            gap-3
                        "
          >

            <div
              className="
                                h-px
                                flex-1
                                bg-white/[0.07]
                            "
            />





            <div
              className="
                                h-px
                                flex-1
                                bg-white/[0.07]
                            "
            />

          </div>


          {/* =================================================
                        LOGIN CARD
                    ================================================= */}

          <div
            className="
                            overflow-hidden
                            rounded-2xl
                            border
                            border-white/[0.10]
                            bg-[#0b1220]/90
                            shadow-2xl
                            shadow-black/40
                            backdrop-blur-xl
                        "
          >

            {/* Top accent */}

            <div
              className="
                                h-px
                                w-full
                                bg-gradient-to-r
                                from-transparent
                                via-blue-500/70
                                to-transparent
                            "
            />


            <div
              className="
                                p-6
                                sm:p-8
                            "
            >

              {/* Shield */}

              <div
                className="
                                    mb-6
                                    flex
                                    h-11
                                    w-11
                                    items-center
                                    justify-center
                                    rounded-xl
                                    border
                                    border-blue-500/20
                                    bg-blue-500/[0.08]
                                "
              >

                <HiOutlineShieldCheck
                  className="
                                        h-6
                                        w-6
                                        text-blue-400
                                    "
                />

              </div>


              <h1
                className="
                                    text-2xl
                                    font-semibold
                                    tracking-tight
                                "
              >
                Sign in
              </h1>


              <p
                className="
                                    mt-2
                                    text-sm
                                    text-slate-500
                                "
              >
                Enter your credentials to continue.
              </p>


              {/* =================================================
                                FORM
                            ================================================= */}

              <form
                onSubmit={handleSubmit}
                className="
                                    mt-7
                                    space-y-5
                                "
              >

                {/* Email */}

                <div>

                  <label
                    htmlFor="email"
                    className="
                                            mb-2
                                            block
                                            text-xs
                                            font-medium
                                            uppercase
                                            tracking-wide
                                            text-slate-400
                                        "
                  >
                    Email address
                  </label>


                  <div
                    className="
                                            relative
                                        "
                  >

                    <HiOutlineEnvelope
                      className="
                                                pointer-events-none
                                                absolute
                                                left-3.5
                                                top-1/2
                                                h-5
                                                w-5
                                                -translate-y-1/2
                                                text-slate-600
                                            "
                    />


                    <input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(event) =>
                        setEmail(
                          event.target.value
                        )
                      }
                      autoComplete="email"
                      placeholder="Enter your email"
                      disabled={loading}
                      className="
                                                h-12
                                                w-full
                                                rounded-xl
                                                border
                                                border-white/[0.09]
                                                bg-[#060c18]
                                                pl-11
                                                pr-4
                                                text-sm
                                                text-white
                                                outline-none
                                                placeholder:text-slate-700
                                                transition
                                                focus:border-blue-500/60
                                                focus:ring-2
                                                focus:ring-blue-500/10
                                                disabled:cursor-not-allowed
                                                disabled:opacity-50
                                            "
                    />

                  </div>

                </div>


                {/* Password */}

                <div>

                  <label
                    htmlFor="password"
                    className="
                                            mb-2
                                            block
                                            text-xs
                                            font-medium
                                            uppercase
                                            tracking-wide
                                            text-slate-400
                                        "
                  >
                    Password
                  </label>


                  <div
                    className="
                                            relative
                                        "
                  >

                    <HiOutlineLockClosed
                      className="
                                                pointer-events-none
                                                absolute
                                                left-3.5
                                                top-1/2
                                                h-5
                                                w-5
                                                -translate-y-1/2
                                                text-slate-600
                                            "
                    />


                    <input
                      id="password"
                      type={
                        showPassword
                          ? "text"
                          : "password"
                      }
                      value={password}
                      onChange={(event) =>
                        setPassword(
                          event.target.value
                        )
                      }
                      autoComplete="current-password"
                      placeholder="Enter your password"
                      disabled={loading}
                      className="
                                                h-12
                                                w-full
                                                rounded-xl
                                                border
                                                border-white/[0.09]
                                                bg-[#060c18]
                                                pl-11
                                                pr-12
                                                text-sm
                                                text-white
                                                outline-none
                                                placeholder:text-slate-700
                                                transition
                                                focus:border-blue-500/60
                                                focus:ring-2
                                                focus:ring-blue-500/10
                                                disabled:cursor-not-allowed
                                                disabled:opacity-50
                                            "
                    />


                    <button
                      type="button"
                      onClick={() =>
                        setShowPassword(
                          value =>
                            !value
                        )
                      }
                      disabled={loading}
                      aria-label={
                        showPassword
                          ? "Hide password"
                          : "Show password"
                      }
                      className="
                                                absolute
                                                right-2
                                                top-1/2
                                                flex
                                                h-8
                                                w-8
                                                -translate-y-1/2
                                                items-center
                                                justify-center
                                                rounded-lg
                                                text-slate-600
                                                transition
                                                hover:bg-white/[0.05]
                                                hover:text-slate-300
                                            "
                    >

                      {showPassword ? (

                        <HiOutlineEyeSlash
                          className="
                                                        h-5
                                                        w-5
                                                    "
                        />

                      ) : (

                        <HiOutlineEye
                          className="
                                                        h-5
                                                        w-5
                                                    "
                        />

                      )}

                    </button>

                  </div>

                </div>


                {/* =================================================
                                    SIGN IN BUTTON
                                ================================================= */}

                <button
                  type="submit"
                  disabled={loading}
                  className="
                                        mt-2
                                        flex
                                        h-12
                                        w-full
                                        items-center
                                        justify-center
                                        gap-2
                                        rounded-xl
                                        bg-blue-600
                                        text-sm
                                        font-semibold
                                        tracking-wide
                                        text-white
                                        shadow-lg
                                        shadow-blue-600/10
                                        transition
                                        hover:bg-blue-500
                                        hover:shadow-blue-500/20
                                        active:scale-[0.99]
                                        disabled:cursor-not-allowed
                                        disabled:opacity-50
                                    "
                >

                  {loading ? (

                    <>
                      <span
                        className="
                                                    h-4
                                                    w-4
                                                    animate-spin
                                                    rounded-full
                                                    border-2
                                                    border-white/30
                                                    border-t-white
                                                "
                      />

                      Signing in...
                    </>

                  ) : (

                    "Sign in"

                  )}

                </button>

              </form>


              {/* =================================================
                                SECURITY
                            ================================================= */}

              <div
                className="
                                    mt-7
                                    border-t
                                    border-white/[0.07]
                                    pt-5
                                "
              >

                <div
                  className="
                                        flex
                                        items-center
                                        justify-center
                                        gap-2
                                    "
                >

                  <HiOutlineLockClosed
                    className="
                                            h-4
                                            w-4
                                            text-blue-500/70
                                        "
                  />


                  <span
                    className="
                                            text-xs
                                            text-slate-600
                                        "
                  >
                    Authorized access only
                  </span>

                </div>

              </div>

            </div>

          </div>


          {/* =================================================
                        FOOTER
                    ================================================= */}

          <div
            className="
                            mt-6
                            flex
                            items-center
                            justify-between
                            px-1
                        "
          >

            <span
              className="
                                text-[11px]
                                text-slate-700
                            "
            >
              Team Work
            </span>


            <span
              className="
                                text-[11px]
                                text-slate-700
                            "
            >
              © {new Date().getFullYear()}
            </span>

          </div>

        </div>

      </section>

    </main>
  );
}