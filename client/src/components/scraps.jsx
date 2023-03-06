REGISTRATION

<div className="mt-6 flex flex-col items-center">
  <Card imgSrc="https://flowbite.com/docs/images/blog/image-4.jpg">
    <form className="flex flex-col items-center gap-4" onSubmit={register}>
      <div>
        <div className="mb-2 block">
          <label htmlFor="username">Username</label>
        </div>
        <TextInput
          id="username"
          type="text"
          placeholder="Your username"
          required
          onChange={handleUsernameReg}
        />
      </div>
      <div>
        <div className="mb-2 block">
          <label htmlFor="email">Email</label>
        </div>
        <TextInput
          id="email"
          type="email"
          placeholder="name@email.com"
          required
          onChange={handleEmailReg}
        />
      </div>
      <div>
        <div className="mb-2 block">
          <label htmlFor="password">Password</label>
        </div>
        <TextInput
          id="password"
          type="password"
          required
          onChange={handlePasswordReg}
        />
      </div>
      <Button type="submit">Register new account</Button>
    </form>
  </Card>
</div>;
